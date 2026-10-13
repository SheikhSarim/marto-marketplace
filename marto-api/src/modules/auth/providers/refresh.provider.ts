import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/modules/users/users.service';
import { GenerateTokenProvider } from './generate-token.provider';

@Injectable()
export class RefreshProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly userService: UsersService,
    private readonly generateTokenProvider: GenerateTokenProvider,
  ) {}

  async refresh(request: Request, response: Response) {
    const refreshToken =
      request.cookies?.refresh_token || request.headers['x-refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token not found');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfiguration.secret,
      });
    } catch (error) {
      throw new UnauthorizedException('Refresh token expired or invalid.');
    }

    const user = await this.userService.findUserById(payload.sub);

    if (!user) throw new UnauthorizedException('User not found');

    const tokens = await this.generateTokenProvider.generateTokens(
      user,
      response,
    );

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    };
  }
}
