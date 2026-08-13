import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event, EventStatus, Prisma, Role } from '../../../../generated/prisma/client';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventRepository } from '../repositories/event.repository';

@Injectable()
export class EventsService {
  constructor(private readonly eventRepository: EventRepository) {}

  async create(dto: CreateEventDto, organizer: AuthenticatedUser): Promise<Event> {
    try {
      return await this.eventRepository.create({
        title: dto.title,
        description: dto.description,
        place: dto.place,
        totalCapacity: dto.totalCapacity,
        stock: dto.totalCapacity,
        priceInCents: dto.priceInCents,
        date: new Date(dto.date),
        ticketmasterId: dto.ticketmasterId,
        imageUrl: dto.imageUrl,
        organizerId: organizer.id,
        status: EventStatus.DRAFT,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Este item do catálogo já foi importado.');
      }

      throw error;
    }
  }

  async listEvents(user: AuthenticatedUser | null): Promise<Event[]> {
    if (user?.role === Role.ORGANIZADOR) {
      const [published, ownNonPublished] = await Promise.all([
        this.eventRepository.findPublished(),
        this.eventRepository.findByOrganizerAndStatuses(user.id, [
          EventStatus.DRAFT,
          EventStatus.CANCELLED,
          EventStatus.COMPLETED,
        ]),
      ]);

      return [...published, ...ownNonPublished];
    }

    return this.eventRepository.findPublished();
  }

  async getEventById(id: string, user: AuthenticatedUser | null): Promise<Event> {
    const event = await this.eventRepository.findById(id);

    if (!event || !this.isEventVisible(event, user)) {
      throw new NotFoundException('Evento não encontrado.');
    }

    return event;
  }

  async updateEvent(id: string, dto: UpdateEventDto, user: AuthenticatedUser): Promise<Event> {
    const event = await this.eventRepository.findById(id);

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para editar este evento.');
    }

    if (event.status !== EventStatus.DRAFT) {
      throw new ConflictException('Eventos publicados não podem ser editados.');
    }

    return this.eventRepository.update(id, {
      title: dto.title,
      description: dto.description,
      place: dto.place,
      totalCapacity: dto.totalCapacity,
      stock: dto.totalCapacity,
      priceInCents: dto.priceInCents,
      date: dto.date ? new Date(dto.date) : undefined,
      imageUrl: dto.imageUrl,
    });
  }

  async publishEvent(id: string, user: AuthenticatedUser): Promise<Event> {
    const event = await this.eventRepository.findById(id);

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para publicar este evento.');
    }

    if (event.status !== EventStatus.DRAFT) {
      throw new ConflictException('Apenas eventos em rascunho podem ser publicados.');
    }

    return this.eventRepository.publish(id);
  }

  private isEventVisible(event: Event, user: AuthenticatedUser | null): boolean {
    if (event.status === EventStatus.PUBLISHED) {
      return true;
    }

    return user?.role === Role.ORGANIZADOR && user.id === event.organizerId;
  }
}
