import { Module } from '@nestjs/common';
import { GuardsModule } from '../../shared/guards/guards.module';
import { TicketsController } from './controllers/tickets.controller';
import { TicketRepository } from './repositories/ticket.repository';
import { TicketsService } from './services/tickets.service';

@Module({
  imports: [GuardsModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketRepository],
  exports: [TicketRepository],
})
export class TicketsModule {}
