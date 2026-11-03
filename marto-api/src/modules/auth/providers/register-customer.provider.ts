import { ConflictException, Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { UserRole } from '../../../common/enums/user-roles.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';
import { HashProvider } from './hash.provider';

import { RegisterCustomerDto } from '../dto/register-customer.dto';

import { EmailVerificationService } from '../../mail/email-verification.service';

@Injectable()
export class RegisterCustomerProvider {
  constructor(
    private readonly dataSource: DataSource,
    private readonly hashProvider: HashProvider,
    private readonly verification: EmailVerificationService,
  ) {}

  async register(dto: RegisterCustomerDto) {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email } });
    if (exists)
      throw new ConflictException('This email is already registered.');

    const password = await this.hashProvider.hashPassword(dto.password);
    const user = await this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(User);
      const customers = manager.getRepository(Customer);
      const created = users.create({
        name: dto.full_name.trim(),
        email,
        password,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      });
      const saved = await users.save(created);
      await customers.save(
        customers.create({
          user: saved,
          full_name: dto.full_name.trim(),
          phone: dto.phone?.trim() || null,
        }),
      );
      return saved;
    });

    let emailSent = false;
    try {
      await this.verification.sendVerificationEmail(user.id);
      emailSent = true;
    } catch {
      /* registration remains persisted; resend endpoint can retry */
    }

    return {
      success: true,
      message: emailSent
        ? 'Customer account created. Please verify your email before logging in.'
        : 'Account created, but verification email could not be sent. Request another verification email.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_email_verified: user.is_email_verified,
        },
        email_verification: { required: true, email_sent: emailSent },
      },
    };
  }
}
