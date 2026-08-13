import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Event, Role } from '../../../../generated/prisma/client';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { OptionalAuthGuard } from '../../../shared/guards/optional-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventsService } from '../services/events.service';

type RequestWithOptionalUser = Request & { user: AuthenticatedUser | null };
type RequestWithUser = Request & { user: AuthenticatedUser };

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANIZADOR)
  create(@Body() dto: CreateEventDto, @Req() req: RequestWithUser): Promise<Event> {
    return this.eventsService.create(dto, req.user);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(@Req() req: RequestWithOptionalUser): Promise<Event[]> {
    return this.eventsService.listEvents(req.user);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANIZADOR)
  publish(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Event> {
    return this.eventsService.publishEvent(id, req.user);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(@Param('id') id: string, @Req() req: RequestWithOptionalUser): Promise<Event> {
    return this.eventsService.getEventById(id, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANIZADOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: RequestWithUser,
  ): Promise<Event> {
    return this.eventsService.updateEvent(id, dto, req.user);
  }
}
