import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Event,
  EventStatus,
  Reservation,
  ReservationStatus,
  Role,
} from '../../../../generated/prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { EventRepository } from '../../events/repositories/event.repository';
import { ReservationRepository } from '../repositories/reservation.repository';
import { ReservationsService } from '../services/reservations.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: { $transaction: jest.Mock };
  let eventRepository: jest.Mocked<Pick<EventRepository, 'findById' | 'decrementStockIfAvailable'>>;
  let reservationRepository: jest.Mocked<
    Pick<ReservationRepository, 'create' | 'findByIdWithRelationsInTransaction'>
  >;

  const mockTx = { tx: true };

  const client: AuthenticatedUser = {
    id: 'client-id',
    role: Role.CLIENTE,
    name: 'Cliente',
  };

  const publishedEvent: Event = {
    id: 'event-id',
    title: 'Show',
    description: 'Descrição',
    place: 'Arena',
    totalCapacity: 100,
    stock: 50,
    priceInCents: 2500,
    date: new Date(),
    imageUrl: null,
    status: EventStatus.PUBLISHED,
    ticketmasterId: 'tm-001',
    createdAt: new Date(),
    updatedAt: new Date(),
    organizerId: 'organizer-id',
    gateProfileId: null,
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (callback: (tx: typeof mockTx) => Promise<unknown>) =>
        callback(mockTx),
      ),
    };

    eventRepository = {
      findById: jest.fn(),
      decrementStockIfAvailable: jest.fn(),
    };

    reservationRepository = {
      create: jest.fn(),
      findByIdWithRelationsInTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventRepository, useValue: eventRepository },
        { provide: ReservationRepository, useValue: reservationRepository },
      ],
    }).compile();

    service = module.get(ReservationsService);
  });

  describe('createReservation', () => {
    it('lança NotFoundException quando o evento não existe', async () => {
      eventRepository.findById.mockResolvedValue(null);

      await expect(
        service.createReservation({ eventId: publishedEvent.id, quantity: 2 }, client),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createReservation({ eventId: publishedEvent.id, quantity: 2 }, client),
      ).rejects.toThrow('Evento não encontrado.');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('lança NotFoundException quando o evento não está PUBLISHED', async () => {
      eventRepository.findById.mockResolvedValue({
        ...publishedEvent,
        status: EventStatus.DRAFT,
      });

      await expect(
        service.createReservation({ eventId: publishedEvent.id, quantity: 2 }, client),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('lança ConflictException quando o estoque é insuficiente e não cria a reserva', async () => {
      eventRepository.findById.mockResolvedValue(publishedEvent);
      eventRepository.decrementStockIfAvailable.mockResolvedValue({ count: 0 });

      await expect(
        service.createReservation({ eventId: publishedEvent.id, quantity: 2 }, client),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.createReservation({ eventId: publishedEvent.id, quantity: 2 }, client),
      ).rejects.toThrow('Estoque insuficiente para esta quantidade.');

      expect(eventRepository.decrementStockIfAvailable).toHaveBeenCalledWith(
        publishedEvent.id,
        2,
        mockTx,
      );
      expect(reservationRepository.create).not.toHaveBeenCalled();
    });

    it('calcula unitPriceInCents e totalPriceInCents corretamente no caminho feliz', async () => {
      const quantity = 3;
      const createdReservation = {
        id: 'reservation-id',
        eventId: publishedEvent.id,
        clientId: client.id,
        quantity,
        unitPriceInCents: publishedEvent.priceInCents,
        totalPriceInCents: publishedEvent.priceInCents * quantity,
        status: ReservationStatus.PENDING,
        createdAt: new Date(),
        expiresAt: null,
      } satisfies Reservation;

      eventRepository.findById.mockResolvedValue(publishedEvent);
      eventRepository.decrementStockIfAvailable.mockResolvedValue({ count: 1 });
      reservationRepository.create.mockResolvedValue(createdReservation);
      reservationRepository.findByIdWithRelationsInTransaction.mockResolvedValue({
        ...createdReservation,
        tickets: [],
        payment: null,
      });

      const result = await service.createReservation(
        { eventId: publishedEvent.id, quantity },
        client,
      );

      expect(reservationRepository.create).toHaveBeenCalledWith(
        {
          eventId: publishedEvent.id,
          clientId: client.id,
          quantity,
          unitPriceInCents: 2500,
          totalPriceInCents: 7500,
          status: ReservationStatus.PENDING,
        },
        mockTx,
      );
      expect(result.unitPriceInCents).toBe(2500);
      expect(result.totalPriceInCents).toBe(7500);
    });
  });
});
