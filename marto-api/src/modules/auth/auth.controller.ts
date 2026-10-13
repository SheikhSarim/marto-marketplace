import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './providers/auth.service';
import { LoginAdminDto } from '../admin/dto/login-admin.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enum/auth-type.enum';

@Controller('auth')
@Auth(AuthType.None)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async loginAdmin(
    @Body() dto: LoginAdminDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginAdmin(dto, response);
  }
}
