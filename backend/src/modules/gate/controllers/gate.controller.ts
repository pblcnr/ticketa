import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../../../../generated/prisma/client';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { ValidateTicketDto } from '../dto/validate-ticket.dto';
import { GateService, GateValidationResult } from '../services/gate.service';

type RequestWithUser = Request & { user: AuthenticatedUser };

@Controller('gate')
export class GateController {
  constructor(private readonly gateService: GateService) {}

  @Post('validate')
  @UseGuards(RolesGuard)
  @Roles(Role.PORTARIA)
  validate(
    @Body() dto: ValidateTicketDto,
    @Req() req: RequestWithUser,
  ): Promise<GateValidationResult> {
    return this.gateService.validateTicket(dto, req.user);
  }
}
