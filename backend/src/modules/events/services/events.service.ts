import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuthError } from '@supabase/supabase-js';
import { Event, EventStatus, Prisma, Role } from '../../../../generated/prisma/client';
import { SupabaseService } from '../../../shared/supabase/supabase.service';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { ProfileRepository } from '../../users/repositories/profile.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { CreateGateUserDto } from '../dto/create-gate-user.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventRepository } from '../repositories/event.repository';

export interface CreateGateUserResult {
  profile: {
    id: string;
    role: Role;
    name: string | null;
  };
  eventId: string;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly supabaseService: SupabaseService,
    private readonly profileRepository: ProfileRepository,
  ) {}

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

  async createGateUser(
    eventId: string,
    dto: CreateGateUserDto,
    organizer: AuthenticatedUser,
  ): Promise<CreateGateUserResult> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    if (event.organizerId !== organizer.id) {
      throw new ForbiddenException('Você não tem permissão para credenciar portaria neste evento.');
    }

    if (event.gateProfileId) {
      throw new ConflictException('Este evento já possui uma portaria vinculada.');
    }

    let authUserId: string | undefined;
    let profileId: string | undefined;

    try {
      const authUser = await this.supabaseService.createUser({
        email: dto.email,
        password: dto.password,
      });

      authUserId = authUser.id;

      const profile = await this.profileRepository.create({
        id: authUser.id,
        role: Role.PORTARIA,
        name: dto.name,
      });

      profileId = profile.id;

      const linkResult = await this.eventRepository.setGateProfileIdIfEmpty(eventId, profile.id);

      if (linkResult.count === 0) {
        throw new ConflictException('Este evento já possui uma portaria vinculada.');
      }

      return {
        profile: {
          id: profile.id,
          role: profile.role,
          name: profile.name,
        },
        eventId,
      };
    } catch (error) {
      if (profileId && authUserId) {
        await this.compensateGateUserCreation(profileId, authUserId);
      } else if (authUserId) {
        await this.compensateOrphanAuthUser(authUserId);
      }

      throw this.toGateUserHttpException(error);
    }
  }

  private async compensateGateUserCreation(profileId: string, authUserId: string): Promise<void> {
    try {
      await this.profileRepository.deleteById(profileId);
    } catch (deleteError) {
      this.logger.error(
        `Falha ao remover profile órfão após erro ao vincular portaria. UUID: ${profileId}`,
        deleteError instanceof Error ? deleteError.stack : String(deleteError),
      );
    }

    await this.compensateOrphanAuthUser(authUserId);
  }

  private async compensateOrphanAuthUser(userId: string): Promise<void> {
    try {
      await this.supabaseService.deleteUser(userId);
    } catch (deleteError) {
      this.logger.error(
        `Falha ao remover usuário órfão no Supabase Auth após erro na criação da portaria. UUID: ${userId}`,
        deleteError instanceof Error ? deleteError.stack : String(deleteError),
      );
    }
  }

  private toGateUserHttpException(error: unknown): Error {
    if (
      error instanceof ConflictException ||
      error instanceof ForbiddenException ||
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      return error;
    }

    if (this.isAuthError(error)) {
      return this.mapGateUserAuthError(error);
    }

    if (error instanceof Error) {
      this.logger.error('Unexpected gate user creation error', error.stack);
    }

    return new InternalServerErrorException('Não foi possível credenciar a portaria.');
  }

  private isAuthError(error: unknown): error is AuthError {
    return typeof error === 'object' && error !== null && 'status' in error && 'message' in error;
  }

  private mapGateUserAuthError(error: AuthError): Error {
    const message = error.message.toLowerCase();

    if (
      error.status === 422 ||
      message.includes('already registered') ||
      message.includes('already been registered') ||
      message.includes('duplicate')
    ) {
      return new ConflictException('Este e-mail já está cadastrado.');
    }

    if (message.includes('password')) {
      return new BadRequestException('A senha informada não atende aos requisitos.');
    }

    this.logger.warn(`Supabase Auth error during gate user creation: ${error.message}`);

    return new BadRequestException(
      'Não foi possível criar a conta de portaria com os dados informados.',
    );
  }

  private isEventVisible(event: Event, user: AuthenticatedUser | null): boolean {
    if (event.status === EventStatus.PUBLISHED) {
      return true;
    }

    return user?.role === Role.ORGANIZADOR && user.id === event.organizerId;
  }
}
