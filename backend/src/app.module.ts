import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { PrismaModule } from './shared/database/prisma.module';
import { SupabaseModule } from './shared/supabase/supabase.module';

@Module({
  imports: [PrismaModule, SupabaseModule, AuthModule, CatalogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
