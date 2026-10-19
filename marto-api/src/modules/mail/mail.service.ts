import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
  ) {}

  async sendSellerApplicationStatus(data: {
    email: string;
    businessName: string;
    status: string;
    description: string;
    submittedAt: string;
  }): Promise<void> {
    try {
      const result = await this.mailerService.sendMail({
        to: data.email,
        subject: 'Marto Marketplace — Seller Application Update',
        template: 'seller/application-status',
        context: {
          businessName: data.businessName,
          status: data.status,
          description: data.description,
          submittedAt: data.submittedAt,
        },
      });

      this.logger.log(
        `Email accepted by mail transport for ${data.email}. Message ID: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to send seller application status email.',
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }
}