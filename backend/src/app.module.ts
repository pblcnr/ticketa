import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { EventsModule } from './modules/events/events.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { PrismaModule } from './shared/database/prisma.module';
import { SupabaseModule } from './shared/supabase/supabase.module';

@Module({
  imports: [
    PrismaModule,
    SupabaseModule,
    AuthModule,
    CatalogModule,
    EventsModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
