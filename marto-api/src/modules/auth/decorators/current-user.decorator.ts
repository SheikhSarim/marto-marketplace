import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../constants/auth.constants';
import { ActiveUser } from '../interface/active-user.interface';

export const CurrentUser = createParamDecorator(
  (field: keyof ActiveUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: ActiveUser = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
