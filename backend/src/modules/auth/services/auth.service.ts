import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthError } from '@supabase/supabase-js';
import { Role } from '../../../../generated/prisma/client';
import { ProfileRepository } from '../../users/repositories/profile.repository';
import { SupabaseService } from '../../../shared/supabase/supabase.service';
import { SignupDto, SignupRole } from '../dto/signup.dto';

export interface SignupResult {
  id: string;
  email: string;
  role: Role;
  name: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async signup(dto: SignupDto): Promise<SignupResult> {
    this.assertSignupRoleAllowed(dto.role);

    let authUserId: string | undefined;

    try {
      const authUser = await this.supabaseService.createUser({
        email: dto.email,
        password: dto.password,
      });

      authUserId = authUser.id;

      const profile = await this.profileRepository.create({
        id: authUser.id,
        role: dto.role,
        name: dto.name,
      });

      return {
        id: profile.id,
        email: authUser.email,
        role: profile.role,
        name: profile.name,
      };
    } catch (error) {
      if (authUserId) {
        await this.compensateOrphanAuthUser(authUserId);
      }

      throw this.toHttpException(error);
    }
  }

  private assertSignupRoleAllowed(role: SignupRole): void {
    if (role !== SignupRole.ORGANIZADOR && role !== SignupRole.CLIENTE) {
      throw new BadRequestException(
        'Role inválida para cadastro. Apenas ORGANIZADOR ou CLIENTE são permitidos.',
      );
    }
  }

  private async compensateOrphanAuthUser(userId: string): Promise<void> {
    try {
      await this.supabaseService.deleteUser(userId);
    } catch (deleteError) {
      this.logger.error(
        `Falha ao remover usuário órfão no Supabase Auth após erro na criação do profile. UUID: ${userId}`,
        deleteError instanceof Error ? deleteError.stack : String(deleteError),
      );
    }
  }

  private toHttpException(error: unknown): Error {
    if (error instanceof BadRequestException) {
      return error;
    }

    if (this.isAuthError(error)) {
      return this.mapAuthError(error);
    }

    if (error instanceof Error) {
      this.logger.error('Unexpected signup error', error.stack);
    }

    return new InternalServerErrorException('Não foi possível concluir o cadastro.');
  }

  private isAuthError(error: unknown): error is AuthError {
    return typeof error === 'object' && error !== null && 'status' in error && 'message' in error;
  }

  private mapAuthError(error: AuthError): Error {
    const message = error.message.toLowerCase();

    if (
      error.status === 422 ||
      message.includes('already registered') ||
      message.includes('already been registered') ||
      message.includes('duplicate')
    ) {
      return new ConflictException('Este e-mail já está cadastrado.');
    }

    if (message.includes('password')) {
      return new BadRequestException('A senha informada não atende aos requisitos.');
    }

    this.logger.warn(`Supabase Auth error during signup: ${error.message}`);

    return new BadRequestException('Não foi possível criar a conta com os dados informados.');
  }
}
