import { Injectable } from '@nestjs/common';
import { Prisma, Ticket, TicketStatus } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';

const eventBasicSelect = {
  title: true,
  date: true,
  place: true,
} as const;

export type TicketWithEventBasic = Ticket & {
  event: {
    title: string;
    date: Date;
    place: string;
  };
};

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByClientId(clientId: string): Promise<TicketWithEventBasic[]> {
    return this.prisma.ticket.findMany({
      where: {
        reservation: { clientId },
      },
      include: {
        event: {
          select: eventBasicSelect,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByQrToken(qrToken: string): Promise<TicketWithEventBasic | null> {
    return this.prisma.ticket.findUnique({
      where: { qrToken },
      include: {
        event: {
          select: eventBasicSelect,
        },
      },
    });
  }

  findByCode(code: string): Promise<Ticket | null> {
    return this.prisma.ticket.findUnique({
      where: { code },
    });
  }

  findByQrTokenOnly(qrToken: string): Promise<Ticket | null> {
    return this.prisma.ticket.findUnique({
      where: { qrToken },
    });
  }

  markAsUsedIfValid(ticketId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.ticket.updateMany({
      where: { id: ticketId, status: TicketStatus.VALID },
      data: { status: TicketStatus.USED, usedAt: new Date() },
    });
  }
}
