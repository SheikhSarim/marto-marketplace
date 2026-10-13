import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { ActiveUser } from '../interface/active-user.interface';
import { User } from '../../users/entities/user.entity';
import { Response } from 'express';

@Injectable()
export class GenerateTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signToken<T>(
    userId: string,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, sub: userId },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async generateTokens(
    user: User,
    response?: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: ActiveUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        payload,
      ),
      this.signToken(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
      ),
    ]);

    if (response) {
      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: this.jwtConfiguration.accessTokenTtl * 1000,
      });

      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: this.jwtConfiguration.refreshTokenTtl * 1000,
      });
    }

    return { accessToken, refreshToken };
  }
}