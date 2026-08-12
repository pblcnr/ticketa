import { Module } from '@nestjs/common';
import { UsersModule } from '../../modules/users/users.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [SupabaseModule, UsersModule],
  providers: [RolesGuard],
  exports: [RolesGuard, SupabaseModule, UsersModule],
})
export class GuardsModule {}
