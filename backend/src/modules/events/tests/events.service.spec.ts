import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Event, EventStatus, Role } from '../../../../generated/prisma/client';
import { SupabaseService } from '../../../shared/supabase/supabase.service';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { ProfileRepository } from '../../users/repositories/profile.repository';
import { EventRepository } from '../repositories/event.repository';
import { EventsService } from '../services/events.service';

describe('EventsService', () => {
  let service: EventsService;
  let eventRepository: jest.Mocked<Pick<EventRepository, 'findById' | 'update'>>;

  const ownerOrganizer: AuthenticatedUser = {
    id: 'owner-organizer-id',
    role: Role.ORGANIZADOR,
    name: 'Organizador Dono',
  };

  const otherOrganizer: AuthenticatedUser = {
    id: 'other-organizer-id',
    role: Role.ORGANIZADOR,
    name: 'Outro Organizador',
  };

  const clientUser: AuthenticatedUser = {
    id: 'client-id',
    role: Role.CLIENTE,
    name: 'Cliente',
  };

  const baseEvent: Event = {
    id: 'event-id',
    title: 'Show',
    description: 'Descrição',
    place: 'Arena',
    totalCapacity: 100,
    stock: 100,
    priceInCents: 5000,
    date: new Date(),
    imageUrl: null,
    status: EventStatus.DRAFT,
    ticketmasterId: 'tm-001',
    createdAt: new Date(),
    updatedAt: new Date(),
    organizerId: ownerOrganizer.id,
    gateProfileId: null,
  };

  beforeEach(async () => {
    eventRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EventRepository, useValue: eventRepository },
        { provide: SupabaseService, useValue: {} },
        { provide: ProfileRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(EventsService);
  });

  describe('getEventById (visibilidade)', () => {
    it('evento PUBLISHED é visível para usuário anônimo', async () => {
      const publishedEvent = { ...baseEvent, status: EventStatus.PUBLISHED };
      eventRepository.findById.mockResolvedValue(publishedEvent);

      const result = await service.getEventById(publishedEvent.id, null);

      expect(result).toEqual(publishedEvent);
    });

    it('evento PUBLISHED é visível para usuário autenticado que não é o organizador', async () => {
      const publishedEvent = { ...baseEvent, status: EventStatus.PUBLISHED };
      eventRepository.findById.mockResolvedValue(publishedEvent);

      const result = await service.getEventById(publishedEvent.id, clientUser);

      expect(result).toEqual(publishedEvent);
    });

    it('evento DRAFT é visível apenas para o organizador dono', async () => {
      eventRepository.findById.mockResolvedValue(baseEvent);

      const result = await service.getEventById(baseEvent.id, ownerOrganizer);

      expect(result).toEqual(baseEvent);
    });

    it('evento DRAFT não é visível para outro organizador', async () => {
      eventRepository.findById.mockResolvedValue(baseEvent);

      await expect(service.getEventById(baseEvent.id, otherOrganizer)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('evento DRAFT não é visível para usuário anônimo', async () => {
      eventRepository.findById.mockResolvedValue(baseEvent);

      await expect(service.getEventById(baseEvent.id, null)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEvent', () => {
    it('lança ConflictException quando o evento não está em status DRAFT, mesmo sendo o dono', async () => {
      eventRepository.findById.mockResolvedValue({
        ...baseEvent,
        status: EventStatus.PUBLISHED,
      });

      await expect(
        service.updateEvent(baseEvent.id, { title: 'Novo título' }, ownerOrganizer),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.updateEvent(baseEvent.id, { title: 'Novo título' }, ownerOrganizer),
      ).rejects.toThrow('Eventos publicados não podem ser editados.');
      expect(eventRepository.update).not.toHaveBeenCalled();
    });

    it('lança ForbiddenException quando quem chama não é o organizador dono', async () => {
      eventRepository.findById.mockResolvedValue(baseEvent);

      await expect(
        service.updateEvent(baseEvent.id, { title: 'Novo título' }, otherOrganizer),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateEvent(baseEvent.id, { title: 'Novo título' }, otherOrganizer),
      ).rejects.toThrow('Você não tem permissão para editar este evento.');
      expect(eventRepository.update).not.toHaveBeenCalled();
    });
  });
});
