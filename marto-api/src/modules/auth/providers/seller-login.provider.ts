import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../../common/enums/user-roles.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';
import { SellerStatus } from '../../../common/enums/seller-status.enum';
import { HashProvider } from './hash.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { LoginSellerDto } from '../dto/login-seller.dto';

@Injectable()
export class SellerLoginProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashProvider: HashProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
  ) {}

  async login(dto: LoginSellerDto, response?: Response) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.seller', 'seller')
      .addSelect('user.password')
      .where('LOWER(user.email) = :email', { email })
      .getOne();

    if (
      !user ||
      user.role !== UserRole.SELLER ||
      !user.password ||
      !(await this.hashProvider.comparePassword(dto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.is_email_verified) {
      throw new ForbiddenException(
        'Please verify your email address before logging in.',
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Your seller account is not active.');
    }

    if (
      !user.seller ||
      user.seller.status !== SellerStatus.APPROVED ||
      !user.seller.approved
    ) {
      throw new ForbiddenException(
        'Your seller application is awaiting admin approval.',
      );
    }

    user.last_login_at = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokenProvider.generateTokens(
      user,
      response,
    );

    return {
      success: true,
      message: 'Seller login successful.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_email_verified: user.is_email_verified,
        },
        application: {
          status: user.seller.status,
          approved: user.seller.approved,
        },
        ...tokens,
      },
    };
  }
}
