import { UserRole } from 'src/common/enums/user-roles.enum';

export interface ActiveUser {
  sub: string;
  email: string;
  role: UserRole;
}
