import { Module } from '@nestjs/common';
import { GuardsModule } from '../../shared/guards/guards.module';
import { EventsModule } from '../events/events.module';
import { ReservationsController } from './controllers/reservations.controller';
import { ReservationRepository } from './repositories/reservation.repository';
import { ReservationsService } from './services/reservations.service';

@Module({
  imports: [GuardsModule, EventsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationRepository],
})
export class ReservationsModule {}
