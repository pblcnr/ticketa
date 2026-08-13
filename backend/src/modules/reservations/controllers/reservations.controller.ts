import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../../../../generated/prisma/client';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { PayReservationDto } from '../dto/pay-reservation.dto';
import { ReservationWithRelations } from '../repositories/reservation.repository';
import { ReservationsService } from '../services/reservations.service';

type RequestWithUser = Request & { user: AuthenticatedUser };

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENTE)
  create(
    @Body() dto: CreateReservationDto,
    @Req() req: RequestWithUser,
  ): Promise<ReservationWithRelations> {
    return this.reservationsService.createReservation(dto, req.user);
  }

  @Post(':id/pay')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENTE)
  pay(
    @Param('id') id: string,
    @Body() dto: PayReservationDto,
    @Req() req: RequestWithUser,
  ): Promise<ReservationWithRelations> {
    return this.reservationsService.payReservation(id, dto, req.user);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser): Promise<ReservationWithRelations> {
    return this.reservationsService.getReservationById(id, req.user);
  }
}
