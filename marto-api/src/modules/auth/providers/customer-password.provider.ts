
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createHash, randomBytes } from 'node:crypto';

import { User } from '../../users/entities/user.entity';

import { UserRole } from '../../../common/enums/user-roles.enum';

import { HashProvider } from './hash.provider';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class CustomerPasswordProvider {
  constructor(
    private readonly dataSource: DataSource,
    private readonly hashProvider: HashProvider,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  // FORGOT PASSWORD

  async forgotPassword(emailInput: string) {
    const email = emailInput.trim().toLowerCase();

    const repo = this.dataSource.getRepository(User);

    const user = await repo.findOne({
      where: {
        email,
        role: UserRole.CUSTOMER,
      },
    });

    if (user) {
      const raw = randomBytes(32).toString('hex');

      user.password_reset_token_hash = createHash('sha256')
        .update(raw)
        .digest('hex');

      user.password_reset_token_expires_at = new Date(
        Date.now() + 60 * 60 * 1000,
      );

      await repo.save(user);

      const frontend = (
        this.config.get<string>('FRONTEND_URL') ||
        'http://localhost:3000'
      ).replace(/\/+$/, '');

      await this.mail.sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl: `${frontend}/reset-password?token=${raw}`,
      });
    }

    return {
      success: true,
      message:
        'If a customer account exists for this email, a password reset link has been sent.',
    };
  }

  // RESET PASSWORD

  async resetPassword(
    rawToken: string,
    newPassword: string,
  ) {
    const hash = createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const repo = this.dataSource.getRepository(User);

    const user = await repo
      .createQueryBuilder('user')
      .addSelect([
        'user.password_reset_token_hash',
        'user.password_reset_token_expires_at',
      ])
      .where(
        'user.password_reset_token_hash = :hash',
        { hash },
      )
      .andWhere(
        'user.password_reset_token_expires_at > :now',
        { now: new Date() },
      )
      .andWhere(
        'user.role = :role',
        { role: UserRole.CUSTOMER },
      )
      .getOne();

    if (!user) {
      throw new UnauthorizedException(
        'The password reset link is invalid or expired.',
      );
    }

    user.password = await this.hashProvider.hashPassword(
      newPassword,
    );

    user.password_reset_token_hash = null;
    user.password_reset_token_expires_at = null;

    await repo.save(user);

    return {
      success: true,
      message: 'Password has been reset successfully.',
    };
  }
}
