import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

export interface CreateAuthUserInput {
  email: string;
  password: string;
}

export interface CreateAuthUserResult {
  id: string;
  email: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInResult {
  id: string;
  accessToken: string;
}

export interface AuthenticatedAuthUser {
  id: string;
}

export class InvalidAccessTokenError extends Error {
  constructor() {
    super('Invalid or expired access token');
    this.name = 'InvalidAccessTokenError';
  }
}

@Injectable()
export class SupabaseService {
  private readonly adminClient: ReturnType<typeof createClient>;
  private readonly publicClient: ReturnType<typeof createClient>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set',
      );
    }

    if (!supabaseAnonKey) {
      throw new Error('SUPABASE_ANON_KEY environment variable must be set');
    }

    const clientOptions = {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    };

    this.adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, clientOptions);
    this.publicClient = createClient(supabaseUrl, supabaseAnonKey, clientOptions);
  }

  async createUser(input: CreateAuthUserInput): Promise<CreateAuthUserResult> {
    const { data, error } = await this.adminClient.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Supabase Auth did not return a user after creation');
    }

    return {
      id: data.user.id,
      email: data.user.email ?? input.email,
    };
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.adminClient.auth.admin.deleteUser(userId);

    if (error) {
      throw error;
    }
  }

  async signInWithPassword(input: SignInInput): Promise<SignInResult> {
    const { data, error } = await this.publicClient.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw error;
    }

    if (!data.user || !data.session) {
      throw new Error('Supabase Auth did not return a session after sign-in');
    }

    return {
      id: data.user.id,
      accessToken: data.session.access_token,
    };
  }

  async getUserFromAccessToken(accessToken: string): Promise<AuthenticatedAuthUser> {
    const { data, error } = await this.publicClient.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new InvalidAccessTokenError();
    }

    return { id: data.user.id };
  }
}
