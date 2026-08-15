import { Module } from '@nestjs/common';
import { GuardsModule } from '../../shared/guards/guards.module';
import { SupabaseModule } from '../../shared/supabase/supabase.module';
import { UsersModule } from '../users/users.module';
import { EventsController } from './controllers/events.controller';
import { EventRepository } from './repositories/event.repository';
import { EventsService } from './services/events.service';

@Module({
  imports: [GuardsModule, SupabaseModule, UsersModule],
  controllers: [EventsController],
  providers: [EventsService, EventRepository],
  exports: [EventRepository],
})
export class EventsModule {}
