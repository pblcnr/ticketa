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

@Injectable()
export class SupabaseService {
  private readonly client: ReturnType<typeof createClient>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set',
      );
    }

    this.client = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async createUser(input: CreateAuthUserInput): Promise<CreateAuthUserResult> {
    const { data, error } = await this.client.auth.admin.createUser({
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
    const { error } = await this.client.auth.admin.deleteUser(userId);

    if (error) {
      throw error;
    }
  }
}
