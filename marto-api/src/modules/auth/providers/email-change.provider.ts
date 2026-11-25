
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { DataSource, QueryFailedError } from 'typeorm';
import { createHash, randomBytes } from 'node:crypto';

import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../../common/enums/user-roles.enum';

import { HashProvider } from './hash.provider';
import { MailService } from '../../mail/mail.service';

const EMAIL_CHANGE_TOKEN_TTL_HOURS = 1;

@Injectable()
export class EmailChangeProvider {
  private readonly logger = new Logger(EmailChangeProvider.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly hashProvider: HashProvider,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async requestEmailChange(
    userId: string,
    role: UserRole,
    currentPassword: string,
    newEmailInput: string,
  ) {
    this.validateRole(role);

    const newEmail = newEmailInput.trim().toLowerCase();

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + EMAIL_CHANGE_TOKEN_TTL_HOURS * 60 * 60 * 1000,
    );

    const user = await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);

      const currentUser = await userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .setLock('pessimistic_write')
        .where('user.id = :userId', { userId })
        .andWhere('user.role = :role', { role })
        .getOne();

      if (!currentUser) {
        throw new NotFoundException('User account was not found.');
      }

      if (!currentUser.password) {
        throw new UnauthorizedException(
          'Password verification is unavailable for this account.',
        );
      }

      const passwordMatches = await this.hashProvider.comparePassword(
        currentPassword,
        currentUser.password,
      );

      if (!passwordMatches) {
        throw new UnauthorizedException('Current password is incorrect.');
      }

      if (newEmail === currentUser.email.toLowerCase()) {
        throw new BadRequestException(
          'New email must be different from your current email.',
        );
      }

      const existingUser = await userRepository
        .createQueryBuilder('existing')
        .where(
          '(LOWER(existing.email) = :newEmail OR LOWER(existing.pending_email) = :newEmail)',
          { newEmail },
        )
        .andWhere('existing.id != :userId', { userId })
        .getOne();

      if (existingUser) {
        throw new ConflictException(
          'This email address is already registered or has a pending verification request.',
        );
      }

      currentUser.pending_email = newEmail;
      currentUser.email_change_token_hash = tokenHash;
      currentUser.email_change_token_expires_at = expiresAt;

      return userRepository.save(currentUser);
    });

    const configuredBaseUrl =
      this.configService.get<string>('FRONTEND_URL') ??
      'http://localhost:3000';

    const baseUrl = configuredBaseUrl.replace(/\/+$/, '');

    const verificationUrl =
      `${baseUrl}/verify-email-change?token=${rawToken}`;

    try {
      await this.mailService.sendEmailChangeVerification({
        email: newEmail,
        name: user.name,
        verificationUrl,
        expiresInHours: EMAIL_CHANGE_TOKEN_TTL_HOURS,
      });
    } catch (error) {
      // Only invalidate this request's token.
      // A newer request must not be affected.
      await this.dataSource
        .getRepository(User)
        .createQueryBuilder()
        .update(User)
        .set({
          pending_email: null,
          email_change_token_hash: null,
          email_change_token_expires_at: null,
        })
        .where('id = :userId', { userId })
        .andWhere('email_change_token_hash = :tokenHash', {
          tokenHash,
        })
        .execute();

      throw error;
    }

    this.logger.log(
      `Email change verification requested for ${role} user ${user.id}.`,
    );

    return {
      success: true,
      message:
        'A verification link has been sent to your new email address.',
    };
  }

  async verifyEmailChange(rawToken: string) {
    if (!rawToken || rawToken.length > 256) {
      throw new BadRequestException(
        'The email change verification link is invalid or expired.',
      );
    }

    const tokenHash = createHash('sha256')
      .update(rawToken)
      .digest('hex');

    try {
      const updatedEmail = await this.dataSource.transaction(
        async (manager) => {
          const userRepository = manager.getRepository(User);

          const user = await userRepository
            .createQueryBuilder('user')
            .addSelect([
              'user.email_change_token_hash',
              'user.email_change_token_expires_at',
            ])
            .setLock('pessimistic_write')
            .where('user.email_change_token_hash = :tokenHash', {
              tokenHash,
            })
            .andWhere('user.email_change_token_expires_at > :now', {
              now: new Date(),
            })
            .getOne();

          if (!user || !user.pending_email) {
            throw new BadRequestException(
              'The email change verification link is invalid or expired. Request a new link.',
            );
          }

          this.validateRole(user.role);

          const newEmail = user.pending_email.trim().toLowerCase();

          const existingUser = await userRepository
            .createQueryBuilder('existing')
            .where(
              '(LOWER(existing.email) = :newEmail OR LOWER(existing.pending_email) = :newEmail)',
              { newEmail },
            )
            .andWhere('existing.id != :userId', { userId: user.id })
            .getOne();

          if (existingUser) {
            throw new ConflictException(
              'This email address is already registered or has a pending verification request.',
            );
          }

          user.email = newEmail;
          user.pending_email = null;
          user.email_change_token_hash = null;
          user.email_change_token_expires_at = null;
          user.is_email_verified = true;

          await userRepository.save(user);

          return {
            email: user.email,
            role: user.role,
            id: user.id,
          };
        },
      );

      this.logger.log(
        `Email successfully changed for ${updatedEmail.role} user ${updatedEmail.id}.`,
      );

      return {
        success: true,
        message: 'Your email address has been updated successfully.',
        email: updatedEmail.email,
      };
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          'This email address is already registered.',
        );
      }

      throw error;
    }
  }

  private validateRole(role: UserRole): void {
    if (role !== UserRole.CUSTOMER && role !== UserRole.SELLER) {
      throw new BadRequestException(
        'Email change is not available for this account type.',
      );
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & {
        driverError?: { code?: string };
      }).driverError?.code === '23505'
    );
  }
}
