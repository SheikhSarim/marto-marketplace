import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';

import { User } from '../../users/entities/user.entity';
import { HashProvider } from './hash.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { AdminLoginDto } from '../dto/login-admin-dto';

@Injectable()
export class AdminLoginProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly hashProvider: HashProvider,

    private readonly generateTokenProvider: GenerateTokenProvider,
  ) {}

  async adminlogin(dto: AdminLoginDto, response?: Response) {
    // 1. Find user and explicitly select password
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password 1');
    }

    // 2. Super Admin role check
    if (user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Invalid email or password 2');
    }

    // 3. Account status check
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Your account is not active');
    }

    // 4. Password check
    if (!user.password) {
      throw new UnauthorizedException('Invalid email or password 3');
    }

    const isPasswordValid = await this.hashProvider.comparePassword(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password 4');
    }

    // 5. Update last login
    user.last_login_at = new Date();

    await this.userRepository.save(user);

    // 6. Generate access and refresh tokens
    const tokens = await this.generateTokenProvider.generateTokens(
      user,
      response,
    );

    // 7. Return sanitized response
    return {
      success: true,
      message: 'Super Admin login successful',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  // 8. Remove sensitive user fields
  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
