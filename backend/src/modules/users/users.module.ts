import { Module } from '@nestjs/common';
import { ProfileRepository } from './repositories/profile.repository';

@Module({
  providers: [ProfileRepository],
  exports: [ProfileRepository],
})
export class UsersModule {}
