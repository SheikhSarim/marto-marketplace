
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  // EXISTING SELLER APPLICATION STATUS EMAIL
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
        `Application status email accepted for ${data.email}. Message ID: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to send seller application status email.',
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  // SELLER APPROVAL EMAIL
  async sendSellerApprovalEmail(data: {
    email: string;
    businessName: string;
    submittedAt: string;
  }): Promise<void> {
    try {
      const result = await this.mailerService.sendMail({
        to: data.email,
        subject: 'Marto Marketplace — Your Seller Application is Approved!',
        template: 'seller/application-approved',
        context: {
          businessName: data.businessName,
          submittedAt: data.submittedAt,
        },
      });

      this.logger.log(
        `Seller approval email accepted for ${data.email}. Message ID: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send seller approval email to ${data.email}.`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  // SELLER REJECTION EMAIL
  async sendSellerRejectionEmail(data: {
    email: string;
    businessName: string;
    reason: string;
    submittedAt: string;
  }): Promise<void> {
    try {
      const result = await this.mailerService.sendMail({
        to: data.email,
        subject: 'Marto Marketplace — Seller Application Update',
        template: 'seller/application-rejected',
        context: {
          businessName: data.businessName,
          reason: data.reason,
          submittedAt: data.submittedAt,
        },
      });

      this.logger.log(
        `Seller rejection email accepted for ${data.email}. Message ID: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send seller rejection email to ${data.email}.`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  // EXISTING EMAIL VERIFICATION
  async sendEmailVerification(data: {
    email: string;
    name: string;
    verificationUrl: string;
    expiresInHours: number;
  }): Promise<void> {
    try {
      const result = await this.mailerService.sendMail({
        to: data.email,
        subject: 'Marto Marketplace — Verify your email address',
        template: 'seller/email-verification',
        context: {
          name: data.name,
          verificationUrl: data.verificationUrl,
          expiresInHours: data.expiresInHours,
        },
      });

      this.logger.log(
        `Verification email accepted for ${data.email}. Message ID: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to send seller email-verification email.',
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }
}
