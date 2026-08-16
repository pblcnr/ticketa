import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Event, Role, Ticket, TicketStatus } from '../../../../generated/prisma/client';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { EventRepository } from '../../events/repositories/event.repository';
import { TicketRepository } from '../../tickets/repositories/ticket.repository';
import { GateService } from '../services/gate.service';

describe('GateService', () => {
  let service: GateService;
  let eventRepository: jest.Mocked<Pick<EventRepository, 'findByGateProfileId'>>;
  let ticketRepository: jest.Mocked<
    Pick<TicketRepository, 'findByCode' | 'findByQrTokenOnly' | 'markAsUsedIfValid'>
  >;

  const gateUser: AuthenticatedUser = {
    id: 'gate-profile-id',
    role: Role.PORTARIA,
    name: 'Portaria',
  };

  const linkedEvent = { id: 'event-id' } as Event;

  const baseTicket: Ticket = {
    id: 'ticket-id',
    code: 'ABCD-EFGH',
    qrToken: 'qr-token',
    status: TicketStatus.VALID,
    createdAt: new Date(),
    usedAt: null,
    eventId: 'event-id',
    reservationId: 'reservation-id',
  };

  beforeEach(async () => {
    eventRepository = {
      findByGateProfileId: jest.fn(),
    };

    ticketRepository = {
      findByCode: jest.fn(),
      findByQrTokenOnly: jest.fn(),
      markAsUsedIfValid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GateService,
        { provide: EventRepository, useValue: eventRepository },
        { provide: TicketRepository, useValue: ticketRepository },
      ],
    }).compile();

    service = module.get(GateService);
  });

  describe('validateTicket', () => {
    beforeEach(() => {
      eventRepository.findByGateProfileId.mockResolvedValue(linkedEvent);
    });

    it('retorna INVALID quando o ticket não é encontrado', async () => {
      ticketRepository.findByCode.mockResolvedValue(null);

      const result = await service.validateTicket({ code: 'UNKNOWN-CODE' }, gateUser);

      expect(result).toEqual({ result: 'INVALID' });
      expect(ticketRepository.findByCode).toHaveBeenCalledWith('UNKNOWN-CODE');
      expect(ticketRepository.markAsUsedIfValid).not.toHaveBeenCalled();
    });

    it('retorna WRONG_EVENT quando o ticket pertence a outro evento', async () => {
      ticketRepository.findByCode.mockResolvedValue({
        ...baseTicket,
        eventId: 'other-event-id',
      });

      const result = await service.validateTicket({ code: baseTicket.code }, gateUser);

      expect(result).toEqual({ result: 'WRONG_EVENT' });
      expect(ticketRepository.markAsUsedIfValid).not.toHaveBeenCalled();
    });

    it('retorna ALREADY_USED quando o ticket já está com status USED na leitura inicial', async () => {
      ticketRepository.findByCode.mockResolvedValue({
        ...baseTicket,
        status: TicketStatus.USED,
      });

      const result = await service.validateTicket({ code: baseTicket.code }, gateUser);

      expect(result).toEqual({ result: 'ALREADY_USED' });
      expect(ticketRepository.markAsUsedIfValid).not.toHaveBeenCalled();
    });

    it('retorna VALID e chama markAsUsedIfValid quando o ticket está VALID e a transição atômica retorna count 1', async () => {
      ticketRepository.findByCode.mockResolvedValue(baseTicket);
      ticketRepository.markAsUsedIfValid.mockResolvedValue({ count: 1 });

      const result = await service.validateTicket({ code: baseTicket.code }, gateUser);

      expect(result).toEqual({ result: 'VALID' });
      expect(ticketRepository.markAsUsedIfValid).toHaveBeenCalledWith(baseTicket.id);
    });

    it('retorna VALID quando a validação é feita por qrToken em vez de code', async () => {
      ticketRepository.findByQrTokenOnly.mockResolvedValue(baseTicket);
      ticketRepository.markAsUsedIfValid.mockResolvedValue({ count: 1 });

      const result = await service.validateTicket({ qrToken: baseTicket.qrToken }, gateUser);

      expect(result).toEqual({ result: 'VALID' });
      expect(ticketRepository.findByQrTokenOnly).toHaveBeenCalledWith(baseTicket.qrToken);
      expect(ticketRepository.findByCode).not.toHaveBeenCalled();
      expect(ticketRepository.markAsUsedIfValid).toHaveBeenCalledWith(baseTicket.id);
    });

    it('retorna ALREADY_USED quando markAsUsedIfValid retorna count 0 (corrida perdida)', async () => {
      ticketRepository.findByCode.mockResolvedValue(baseTicket);
      ticketRepository.markAsUsedIfValid.mockResolvedValue({ count: 0 });

      const result = await service.validateTicket({ code: baseTicket.code }, gateUser);

      expect(result).toEqual({ result: 'ALREADY_USED' });
      expect(ticketRepository.markAsUsedIfValid).toHaveBeenCalledWith(baseTicket.id);
    });

    it('lança ConflictException quando a portaria não tem evento vinculado', async () => {
      eventRepository.findByGateProfileId.mockResolvedValue(null);

      await expect(service.validateTicket({ code: baseTicket.code }, gateUser)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.validateTicket({ code: baseTicket.code }, gateUser)).rejects.toThrow(
        'Esta conta de portaria não está vinculada a nenhum evento. Entre em contato com o organizador.',
      );
      expect(ticketRepository.findByCode).not.toHaveBeenCalled();
    });
  });
});
