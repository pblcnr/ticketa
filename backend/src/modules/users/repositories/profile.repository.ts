import { Injectable } from '@nestjs/common';
import { Profile, Role } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';

export interface CreateProfileInput {
  id: string;
  role: Role;
  name?: string;
}

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateProfileInput): Promise<Profile> {
    return this.prisma.profile.create({
      data: {
        id: input.id,
        role: input.role,
        name: input.name,
      },
    });
  }

  findById(id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }
}
