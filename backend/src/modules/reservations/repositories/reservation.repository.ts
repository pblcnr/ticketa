import { Injectable } from '@nestjs/common';
import {
  Payment,
  PaymentStatus,
  Reservation,
  ReservationStatus,
  Ticket,
  TicketStatus,
} from '../../../../generated/prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';

type ReservationDbClient = Pick<PrismaService, 'reservation' | 'payment' | 'ticket'>;

export interface CreateReservationInput {
  eventId: string;
  clientId: string;
  quantity: number;
  unitPriceInCents: number;
  totalPriceInCents: number;
  status: ReservationStatus;
}

export interface CreatePaymentInput {
  reservationId: string;
  amountInCents: number;
  status: PaymentStatus;
}

export interface CreateTicketInput {
  code: string;
  qrToken: string;
  eventId: string;
  reservationId: string;
  status: TicketStatus;
}

export type ReservationWithRelations = Reservation & {
  tickets: Ticket[];
  payment: Payment | null;
};

@Injectable()
export class ReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    input: CreateReservationInput,
    db: ReservationDbClient = this.prisma,
  ): Promise<Reservation> {
    return db.reservation.create({
      data: {
        eventId: input.eventId,
        clientId: input.clientId,
        quantity: input.quantity,
        unitPriceInCents: input.unitPriceInCents,
        totalPriceInCents: input.totalPriceInCents,
        status: input.status,
      },
    });
  }

  findById(id: string): Promise<Reservation | null> {
    return this.prisma.reservation.findUnique({
      where: { id },
    });
  }

  findByIdWithRelations(id: string): Promise<ReservationWithRelations | null> {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: {
        tickets: true,
        payment: true,
      },
    });
  }

  updateStatus(
    id: string,
    status: ReservationStatus,
    db: ReservationDbClient = this.prisma,
  ): Promise<Reservation> {
    return db.reservation.update({
      where: { id },
      data: { status },
    });
  }

  createPayment(
    input: CreatePaymentInput,
    db: ReservationDbClient = this.prisma,
  ): Promise<Payment> {
    return db.payment.create({
      data: {
        reservationId: input.reservationId,
        amountInCents: input.amountInCents,
        status: input.status,
      },
    });
  }

  createTicket(input: CreateTicketInput, db: ReservationDbClient = this.prisma): Promise<Ticket> {
    return db.ticket.create({
      data: {
        code: input.code,
        qrToken: input.qrToken,
        eventId: input.eventId,
        reservationId: input.reservationId,
        status: input.status,
      },
    });
  }

  findByIdWithRelationsInTransaction(
    id: string,
    db: ReservationDbClient,
  ): Promise<ReservationWithRelations | null> {
    return db.reservation.findUnique({
      where: { id },
      include: {
        tickets: true,
        payment: true,
      },
    });
  }
}
