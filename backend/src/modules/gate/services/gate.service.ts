import { ConflictException, Injectable } from '@nestjs/common';
import { TicketStatus } from '../../../../generated/prisma/client';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { EventRepository } from '../../events/repositories/event.repository';
import { TicketRepository } from '../../tickets/repositories/ticket.repository';
import { ValidateTicketDto } from '../dto/validate-ticket.dto';

export type GateValidationResultType = 'VALID' | 'INVALID' | 'ALREADY_USED' | 'WRONG_EVENT';

export interface GateValidationResult {
  result: GateValidationResultType;
}

@Injectable()
export class GateService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly ticketRepository: TicketRepository,
  ) {}

  async validateTicket(
    dto: ValidateTicketDto,
    gateUser: AuthenticatedUser,
  ): Promise<GateValidationResult> {
    const event = await this.eventRepository.findByGateProfileId(gateUser.id);

    if (!event) {
      throw new ConflictException(
        'Esta conta de portaria não está vinculada a nenhum evento. Entre em contato com o organizador.',
      );
    }

    const ticket = dto.code
      ? await this.ticketRepository.findByCode(dto.code.trim())
      : await this.ticketRepository.findByQrTokenOnly(dto.qrToken!.trim());

    if (!ticket) {
      return { result: 'INVALID' };
    }

    if (ticket.eventId !== event.id) {
      return { result: 'WRONG_EVENT' };
    }

    if (ticket.status === TicketStatus.USED) {
      return { result: 'ALREADY_USED' };
    }

    const updateResult = await this.ticketRepository.markAsUsedIfValid(ticket.id);

    if (updateResult.count === 1) {
      return { result: 'VALID' };
    }

    return { result: 'ALREADY_USED' };
  }
}
