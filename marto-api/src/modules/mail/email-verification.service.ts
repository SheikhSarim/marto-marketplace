import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-roles.enum';
import { MailService } from './mail.service';

const VERIFICATION_TOKEN_TTL_HOURS = 24;

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async sendVerificationEmail(userId: string): Promise<void> {
    const users = this.dataSource.getRepository(User);
    const user = await users.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User account was not found.');
    }

    if (user.role !== UserRole.SELLER) {
      throw new BadRequestException(
        'Email verification is only available for seller accounts.',
      );
    }

    if (user.is_email_verified) {
      return;
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(
      Date.now() + VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000,
    );

    user.email_verification_token_hash = tokenHash;
    user.email_verification_token_expires_at = expiresAt;
    await users.save(user);

    const configuredBaseUrl =
      this.configService.get<string>('API_BASE_URL') ?? 'http://localhost:3001';
    const baseUrl = configuredBaseUrl.replace(/\/+$/, '');
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${rawToken}`;

    await this.mailService.sendEmailVerification({
      email: user.email,
      name: user.name,
      verificationUrl,
      expiresInHours: VERIFICATION_TOKEN_TTL_HOURS,
    });

    this.logger.log(
      `email-verification link generated for user ${user.id}.`,
    );
  }

  async verifyEmail(rawToken: string) {
    if (!rawToken || rawToken.length > 256) {
      throw new BadRequestException(
        'The email verification link is invalid or expired.',
      );
    }

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository
      .createQueryBuilder('user')
      .addSelect([
        'user.email_verification_token_hash',
        'user.email_verification_token_expires_at',
      ])
      .where('user.email_verification_token_hash = :tokenHash', { tokenHash })
      .andWhere('user.email_verification_token_expires_at > :now', {
        now: new Date(),
      })
      .getOne();

    if (!user) {
      throw new BadRequestException(
        'The email verification link is invalid or expired. Request a new link.',
      );
    }

    user.is_email_verified = true;
    user.email_verification_token_hash = null;
    user.email_verification_token_expires_at = null;
    await userRepository.save(user);

    return {
      success: true,
      message:
        'Email verified successfully. Your seller application still requires admin approval before login.',
    };
  }

  
}
