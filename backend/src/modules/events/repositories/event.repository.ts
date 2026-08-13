import { Injectable } from '@nestjs/common';
import { Event, EventStatus, Prisma } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';

export interface CreateEventInput {
  title: string;
  description: string;
  place: string;
  totalCapacity: number;
  stock: number;
  priceInCents: number;
  date: Date;
  ticketmasterId: string;
  imageUrl?: string;
  organizerId: string;
  status: EventStatus;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  place?: string;
  totalCapacity?: number;
  stock?: number;
  priceInCents?: number;
  date?: Date;
  imageUrl?: string | null;
}

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateEventInput): Promise<Event> {
    return this.prisma.event.create({
      data: {
        title: input.title,
        description: input.description,
        place: input.place,
        totalCapacity: input.totalCapacity,
        stock: input.stock,
        priceInCents: input.priceInCents,
        date: input.date,
        ticketmasterId: input.ticketmasterId,
        imageUrl: input.imageUrl,
        organizerId: input.organizerId,
        status: input.status,
      },
    });
  }

  findById(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: { id },
    });
  }

  findPublished(): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED },
      orderBy: { date: 'asc' },
    });
  }

  findByOrganizerAndStatuses(organizerId: string, statuses: EventStatus[]): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: {
        organizerId,
        status: { in: statuses },
      },
      orderBy: { date: 'asc' },
    });
  }

  update(id: string, input: UpdateEventInput): Promise<Event> {
    const data: Prisma.EventUpdateInput = {};

    if (input.title !== undefined) {
      data.title = input.title;
    }

    if (input.description !== undefined) {
      data.description = input.description;
    }

    if (input.place !== undefined) {
      data.place = input.place;
    }

    if (input.totalCapacity !== undefined) {
      data.totalCapacity = input.totalCapacity;
    }

    if (input.stock !== undefined) {
      data.stock = input.stock;
    }

    if (input.priceInCents !== undefined) {
      data.priceInCents = input.priceInCents;
    }

    if (input.date !== undefined) {
      data.date = input.date;
    }

    if (input.imageUrl !== undefined) {
      data.imageUrl = input.imageUrl;
    }

    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  publish(id: string): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.PUBLISHED },
    });
  }
}
