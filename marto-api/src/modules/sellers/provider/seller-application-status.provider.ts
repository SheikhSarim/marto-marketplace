import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Seller } from '../entities/seller.entity';
import { MailService } from '../../mail/mail.service';
import { SellerApplicationStatusDto } from '../dto/seller-application-status.dto';

@Injectable()
export class SellerApplicationStatusProvider {
  private readonly logger = new Logger(
    SellerApplicationStatusProvider.name,
  );

  constructor(
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  async sendStatus(dto: SellerApplicationStatusDto) {
    const email = dto.email.trim().toLowerCase();

    const genericResponse = {
      success: true,
      message:
        'If an application exists for this email, status instructions will be sent.',
    };

    const seller = await this.dataSource
      .getRepository(Seller)
      .createQueryBuilder('seller')
      .innerJoinAndSelect('seller.user', 'user')
      .where('LOWER(user.email) = :email', { email })
      .getOne();

    if (!seller) {
      return genericResponse;
    }

    const descriptions: Record<string, string> = {
      PENDING:
        'Your application is awaiting review by our administration team.',
      APPROVED:
        'Your seller application has been approved. Please sign in to continue.',
      DISABLED:
        'Your seller account is currently disabled. Please contact marketplace support.',
      REMOVED:
        'Your seller application or account is no longer active. Please contact support if you need assistance.',
    };

    try {
      await this.mailService.sendSellerApplicationStatus({
        email: seller.user.email,
        businessName: seller.business_name,
        status: seller.status,
        description:
          descriptions[seller.status] ??
          'Please contact marketplace support for an update.',
        submittedAt: seller.created_at.toISOString(),
      });
    } catch (error) {
      this.logger.error(
        'Unable to process seller application status email.',
        error instanceof Error ? error.stack : undefined,
      );

      // Keep the public response generic.
      // A failed delivery must still be monitored internally.
    }

    return genericResponse;
  }
}