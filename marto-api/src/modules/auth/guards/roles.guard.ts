import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "src/common/enums/user-roles.enum";
import { REQUEST_USER_KEY } from "../constants/auth.constants";
import { ActiveUser } from "../interface/active-user.interface";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: ActiveUser = request[REQUEST_USER_KEY];

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        "You do not have permission to access this resource.",
      );
    }

    return true;
  }
}
