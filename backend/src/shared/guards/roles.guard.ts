import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../../../generated/prisma/client';
import { ProfileRepository } from '../../modules/users/repositories/profile.repository';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { InvalidAccessTokenError, SupabaseService } from '../supabase/supabase.service';
import { AuthenticatedUser } from '../types/authenticated-user';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação ausente ou malformado.');
    }

    let authUserId: string;

    try {
      const authUser = await this.supabaseService.getUserFromAccessToken(token);
      authUserId = authUser.id;
    } catch (error) {
      if (error instanceof InvalidAccessTokenError) {
        throw new UnauthorizedException('Token de autenticação inválido ou expirado.');
      }

      this.logger.error(
        'Unexpected error validating access token',
        error instanceof Error ? error.stack : String(error),
      );
      throw new UnauthorizedException('Token de autenticação inválido ou expirado.');
    }

    const profile = await this.profileRepository.findById(authUserId);

    if (!profile) {
      this.logger.error(
        `Usuário autenticado no Supabase Auth sem profile correspondente. UUID: ${authUserId}`,
      );
      throw new UnauthorizedException('Perfil não encontrado.');
    }

    const user: AuthenticatedUser = {
      id: profile.id,
      role: profile.role,
      name: profile.name,
    };
    request.user = user;

    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Permissão insuficiente para acessar este recurso.');
    }

    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const match = /^Bearer\s+(\S+)$/i.exec(authorization);

    if (!match) {
      return null;
    }

    return match[1];
  }
}
