import { Module } from '@nestjs/common';
import { GuardsModule } from '../../shared/guards/guards.module';
import { EventsModule } from '../events/events.module';
import { TicketsModule } from '../tickets/tickets.module';
import { GateController } from './controllers/gate.controller';
import { GateService } from './services/gate.service';

@Module({
  imports: [GuardsModule, EventsModule, TicketsModule],
  controllers: [GateController],
  providers: [GateService],
})
export class GateModule {}
