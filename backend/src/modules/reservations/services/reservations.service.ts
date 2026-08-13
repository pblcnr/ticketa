import { randomBytes } from 'crypto';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EventStatus,
  PaymentStatus,
  Prisma,
  ReservationStatus,
  TicketStatus,
} from '../../../../generated/prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { EventRepository } from '../../events/repositories/event.repository';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { PayReservationDto, PaymentOutcome } from '../dto/pay-reservation.dto';
import {
  ReservationRepository,
  ReservationWithRelations,
} from '../repositories/reservation.repository';

type TransactionClient = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

const TICKET_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_TICKET_GENERATION_ATTEMPTS = 5;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventRepository: EventRepository,
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async createReservation(
    dto: CreateReservationDto,
    client: AuthenticatedUser,
  ): Promise<ReservationWithRelations> {
    const event = await this.eventRepository.findById(dto.eventId);

    if (!event || event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException('Evento não encontrado.');
    }

    const unitPriceInCents = event.priceInCents;
    const totalPriceInCents = unitPriceInCents * dto.quantity;

    return this.prisma.$transaction(async (tx) => {
      const decrementResult = await this.eventRepository.decrementStockIfAvailable(
        dto.eventId,
        dto.quantity,
        tx,
      );

      if (decrementResult.count === 0) {
        throw new ConflictException('Estoque insuficiente para esta quantidade.');
      }

      const reservation = await this.reservationRepository.create(
        {
          eventId: dto.eventId,
          clientId: client.id,
          quantity: dto.quantity,
          unitPriceInCents,
          totalPriceInCents,
          status: ReservationStatus.PENDING,
        },
        tx,
      );

      const reservationWithRelations =
        await this.reservationRepository.findByIdWithRelationsInTransaction(reservation.id, tx);

      if (!reservationWithRelations) {
        throw new Error('Reserva criada não encontrada após criação.');
      }

      return reservationWithRelations;
    });
  }

  async payReservation(
    id: string,
    dto: PayReservationDto,
    client: AuthenticatedUser,
  ): Promise<ReservationWithRelations> {
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    if (reservation.clientId !== client.id) {
      throw new ForbiddenException('Você não tem permissão para pagar esta reserva.');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new ConflictException('Esta reserva não está pendente de pagamento.');
    }

    const paymentStatus =
      dto.outcome === PaymentOutcome.APPROVED ? PaymentStatus.APPROVED : PaymentStatus.DECLINED;

    return this.prisma.$transaction(async (tx) => {
      await this.reservationRepository.createPayment(
        {
          reservationId: reservation.id,
          amountInCents: reservation.totalPriceInCents,
          status: paymentStatus,
        },
        tx,
      );

      if (dto.outcome === PaymentOutcome.APPROVED) {
        await this.reservationRepository.updateStatus(
          reservation.id,
          ReservationStatus.CONFIRMED,
          tx,
        );
        await this.createTicketsForReservation(
          reservation.id,
          reservation.eventId,
          reservation.quantity,
          tx,
        );
      } else {
        await this.reservationRepository.updateStatus(
          reservation.id,
          ReservationStatus.CANCELLED,
          tx,
        );
        await this.eventRepository.incrementStock(reservation.eventId, reservation.quantity, tx);
      }

      const updatedReservation =
        await this.reservationRepository.findByIdWithRelationsInTransaction(reservation.id, tx);

      if (!updatedReservation) {
        throw new Error('Reserva não encontrada após pagamento.');
      }

      return updatedReservation;
    });
  }

  async getReservationById(id: string, user: AuthenticatedUser): Promise<ReservationWithRelations> {
    const reservation = await this.reservationRepository.findByIdWithRelations(id);

    if (!reservation || reservation.clientId !== user.id) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    return reservation;
  }

  private async createTicketsForReservation(
    reservationId: string,
    eventId: string,
    quantity: number,
    tx: TransactionClient,
  ): Promise<void> {
    for (let index = 0; index < quantity; index++) {
      await this.createTicketWithRetry(reservationId, eventId, tx);
    }
  }

  private async createTicketWithRetry(
    reservationId: string,
    eventId: string,
    tx: TransactionClient,
  ): Promise<void> {
    for (let attempt = 0; attempt < MAX_TICKET_GENERATION_ATTEMPTS; attempt++) {
      try {
        await this.reservationRepository.createTicket(
          {
            code: this.generateTicketCode(),
            qrToken: this.generateQrToken(),
            eventId,
            reservationId,
            status: TicketStatus.VALID,
          },
          tx,
        );
        return;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          attempt < MAX_TICKET_GENERATION_ATTEMPTS - 1
        ) {
          continue;
        }

        throw error;
      }
    }
  }

  private generateTicketCode(): string {
    const bytes = randomBytes(8);
    const segment = (offset: number) =>
      Array.from({ length: 4 }, (_, index) => {
        return TICKET_CODE_ALPHABET[bytes[offset + index] % TICKET_CODE_ALPHABET.length];
      }).join('');

    return `${segment(0)}-${segment(4)}`;
  }

  private generateQrToken(): string {
    return randomBytes(32).toString('base64url');
  }
}
