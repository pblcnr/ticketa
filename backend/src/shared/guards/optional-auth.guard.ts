import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ProfileRepository } from '../../modules/users/repositories/profile.repository';
import { InvalidAccessTokenError, SupabaseService } from '../supabase/supabase.service';
import { AuthenticatedUser } from '../types/authenticated-user';

type RequestWithUser = Request & { user: AuthenticatedUser | null };

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthGuard.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    request.user = null;

    const token = this.extractBearerToken(request);

    if (!token) {
      return true;
    }

    try {
      const authUser = await this.supabaseService.getUserFromAccessToken(token);
      const profile = await this.profileRepository.findById(authUser.id);

      if (!profile) {
        this.logger.warn(
          `Token válido sem profile correspondente. UUID: ${authUser.id}. Tratando como anônimo.`,
        );
        return true;
      }

      request.user = {
        id: profile.id,
        role: profile.role,
        name: profile.name,
      };
    } catch (error) {
      if (!(error instanceof InvalidAccessTokenError)) {
        this.logger.error(
          'Unexpected error validating optional access token',
          error instanceof Error ? error.stack : String(error),
        );
      }
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
