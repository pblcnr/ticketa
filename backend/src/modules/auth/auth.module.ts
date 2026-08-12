import { Module } from '@nestjs/common';
import { GuardsModule } from '../../shared/guards/guards.module';
import { SupabaseModule } from '../../shared/supabase/supabase.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [SupabaseModule, UsersModule, GuardsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
