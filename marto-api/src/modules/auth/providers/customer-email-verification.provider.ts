
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../../common/enums/user-roles.enum';

import { EmailVerificationService } from '../../mail/email-verification.service';

@Injectable()
export class CustomerEmailVerificationProvider {
  constructor(
    private readonly dataSource: DataSource,
    private readonly verification: EmailVerificationService,
  ) {}

  // RESEND VERIFICATION EMAIL

  async resendVerification(emailInput: string) {
    const email = emailInput.trim().toLowerCase();

    const user = await this.dataSource
      .getRepository(User)
      .findOne({
        where: {
          email,
          role: UserRole.CUSTOMER,
        },
      });

    // Prevent email enumeration
    if (user && !user.is_email_verified) {
      await this.verification.sendVerificationEmail(
        user.id,
      );
    }

    return {
      success: true,
      message:
        'If the account exists and needs verification, a verification email has been sent.',
    };
  }
}
