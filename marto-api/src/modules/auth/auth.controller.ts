import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './providers/auth.service';
import { AdminLoginDto } from './dto/login-admin-dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
@Auth(AuthType.None)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Silent Session Check
  @Get('session')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Silent session check on app start' })
  async session(@Req() req: any) {
    // console.log('[Session] Cookies:', req.cookies);
    // console.log('[Session] All cookies:', req.cookies);
    // console.log('[Session] access_token:', req.cookies?.access_token);

    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.authService.getSession(req.user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token using refresh_token cookie',
    description:
      'refresh_token cookie ya x-refresh-token header se new access token issue hoga.',
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refresh(request, response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async loginAdmin(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginAdmin(dto, response);
  }
}
