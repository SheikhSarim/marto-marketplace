
import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';
import { Response } from 'express';

import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../../common/enums/user-roles.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';

import { HashProvider } from './hash.provider';
import { GenerateTokenProvider } from './generate-token.provider';

import { LoginCustomerDto } from '../dto/login-customer.dto';

@Injectable()
export class LoginCustomerProvider {
  constructor(
    private readonly dataSource: DataSource,
    private readonly hashProvider: HashProvider,
    private readonly tokens: GenerateTokenProvider,
  ) {}

  async login(dto: LoginCustomerDto, response: Response) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.customer', 'customer')
      .addSelect('user.password')
      .where('LOWER(user.email) = :email', { email })
      .getOne();

    // Validate credentials
    if (
      !user ||
      user.role !== UserRole.CUSTOMER ||
      !user.password ||
      !(await this.hashProvider.comparePassword(
        dto.password,
        user.password,
      ))
    ) {
      throw new UnauthorizedException(
        'Invalid email or password.',
      );
    }

    // Email verification
    if (!user.is_email_verified) {
      throw new ForbiddenException(
        'Please verify your email address before logging in.',
      );
    }

    // Account status
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        'Your account is not active.',
      );
    }

    // Update last login
    user.last_login_at = new Date();

    await this.dataSource
      .getRepository(User)
      .save(user);

    // Generate tokens
    const tokenPair = await this.tokens.generateTokens(
      user,
      response,
    );

    return {
      success: true,
      message: 'Customer login successful.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_email_verified: user.is_email_verified,
        },
        ...tokenPair,
      },
    };
  }
}
