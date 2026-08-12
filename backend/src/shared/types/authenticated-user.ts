import { Role } from '../../../generated/prisma/client';

export interface AuthenticatedUser {
  id: string;
  role: Role;
  name: string | null;
}
