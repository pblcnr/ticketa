import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../../../../generated/prisma/client';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { ClientTicketView, SharedTicketView, TicketsService } from '../services/tickets.service';

type RequestWithUser = Request & { user: AuthenticatedUser };

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENTE)
  getMyTickets(@Req() req: RequestWithUser): Promise<ClientTicketView[]> {
    return this.ticketsService.getMyTickets(req.user);
  }

  @Get('share/:qrToken')
  getSharedTicket(@Param('qrToken') qrToken: string): Promise<SharedTicketView> {
    return this.ticketsService.getSharedTicket(qrToken);
  }
}
