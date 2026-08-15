import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '../../../../generated/prisma/client';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { TicketRepository, TicketWithEventBasic } from '../repositories/ticket.repository';

export interface ClientTicketView {
  id: string;
  code: string;
  qrToken: string;
  status: TicketStatus;
  usedAt: Date | null;
  event: {
    title: string;
    date: Date;
    place: string;
  };
}

export interface SharedTicketView {
  status: TicketStatus;
  event: {
    title: string;
    date: Date;
    place: string;
  };
}

@Injectable()
export class TicketsService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async getMyTickets(client: AuthenticatedUser): Promise<ClientTicketView[]> {
    const tickets = await this.ticketRepository.findByClientId(client.id);

    return tickets.map((ticket) => this.toClientTicketView(ticket));
  }

  async getSharedTicket(qrToken: string): Promise<SharedTicketView> {
    const ticket = await this.ticketRepository.findByQrToken(qrToken);

    if (!ticket) {
      throw new NotFoundException('Ingresso não encontrado.');
    }

    return {
      status: ticket.status,
      event: ticket.event,
    };
  }

  private toClientTicketView(ticket: TicketWithEventBasic): ClientTicketView {
    return {
      id: ticket.id,
      code: ticket.code,
      qrToken: ticket.qrToken,
      status: ticket.status,
      usedAt: ticket.usedAt,
      event: ticket.event,
    };
  }
}
