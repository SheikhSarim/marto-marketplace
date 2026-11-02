
import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { Seller } from '../sellers/entities/seller.entity';
import { Shop, ShopStatus } from '../shops/entities/shop.entity';

import { SellerStatus } from '../../common/enums/seller-status.enum';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  // GET ALL SELLERS
  async listSellers() {
    const sellers = await this.dataSource
      .getRepository(Seller)
      .createQueryBuilder('seller')
      .innerJoinAndSelect('seller.user', 'user')
      .leftJoinAndSelect('seller.shops', 'shop')
      .orderBy('seller.created_at', 'DESC')
      .getMany();

    return {
      success: true,
      data: sellers.map((seller) => ({
        id: seller.id,
        business_name: seller.business_name,
        business_email: seller.business_email,
        status: seller.status,
        approved: seller.approved,
        rejection_reason: seller.rejection_reason,
        created_at: seller.created_at,

        user: {
          id: seller.user.id,
          name: seller.user.name,
          email: seller.user.email,
          email_verified: seller.user.is_email_verified,
        },

        shops: (seller.shops ?? []).map((shop) => ({
          id: shop.id,
          name: shop.name,
          status: shop.status,
        })),
      })),
    };
  }

  // APPROVE SELLER APPLICATION
  async approveApplication(sellerId: string) {
    const result = await this.dataSource.transaction(async (manager) => {
      const sellerRepository = manager.getRepository(Seller);
      const shopRepository = manager.getRepository(Shop);

      const seller = await sellerRepository.findOne({
        where: { id: sellerId },
        relations: ['shops', 'user'],
      });

      if (!seller) {
        throw new NotFoundException(
          'Seller application was not found.',
        );
      }

      if (seller.status !== SellerStatus.PENDING) {
        throw new ConflictException(
          `Only pending seller applications can be approved. Current status: ${seller.status}.`,
        );
      }

      if (!seller.shops?.length) {
        throw new ConflictException(
          'This seller cannot be approved because no shop is associated with the application.',
        );
      }

      // Update seller
      seller.status = SellerStatus.APPROVED;
      seller.approved = true;
      seller.rejection_reason = null;

      const savedSeller = await sellerRepository.save(seller);

      // Activate associated shops
      for (const shop of seller.shops) {
        shop.status = ShopStatus.ACTIVE;
        await shopRepository.save(shop);
      }

      return {
        response: {
          success: true,
          message:
            'Seller application approved and shop activated successfully.',

          data: {
            seller: {
              id: savedSeller.id,
              business_name: savedSeller.business_name,
              status: savedSeller.status,
              approved: savedSeller.approved,
            },

            shops: seller.shops.map((shop) => ({
              id: shop.id,
              name: shop.name,
              status: ShopStatus.ACTIVE,
            })),
          },
        },

        // Approval email data
        email: {
          email: seller.user.email,
          businessName: seller.business_name,
          submittedAt: seller.created_at.toISOString(),
        },
      };
    });

    // Send approval email AFTER transaction commits
    try {
      this.logger.log(
        `Sending seller approval email to ${result.email.email}`,
      );

      await this.mailService.sendSellerApprovalEmail(result.email);

      this.logger.log(
        `Seller approval email accepted for ${result.email.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Seller approval email failed for ${result.email.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return result.response;
  }

  // REJECT SELLER APPLICATION
  async rejectApplication(sellerId: string, reason: string) {
    const result = await this.dataSource.transaction(async (manager) => {
      const sellerRepository = manager.getRepository(Seller);

      const seller = await sellerRepository.findOne({
        where: { id: sellerId },
        relations: ['user'],
      });

      if (!seller) {
        throw new NotFoundException(
          'Seller application was not found.',
        );
      }

      if (seller.status !== SellerStatus.PENDING) {
        throw new ConflictException(
          `Only pending seller applications can be rejected. Current status: ${seller.status}.`,
        );
      }

      // Update seller
      seller.status = SellerStatus.REJECTED;
      seller.approved = false;
      seller.rejection_reason = reason.trim();

      const savedSeller = await sellerRepository.save(seller);

      return {
        response: {
          success: true,
          message: 'Seller application rejected successfully.',

          data: {
            id: savedSeller.id,
            business_name: savedSeller.business_name,
            status: savedSeller.status,
            approved: savedSeller.approved,
            rejection_reason: savedSeller.rejection_reason,
          },
        },

        // Rejection email data
        email: {
          email: seller.user.email,
          businessName: seller.business_name,
          reason: savedSeller.rejection_reason ?? reason.trim(),
          submittedAt: seller.created_at.toISOString(),
        },
      };
    });

    // Send rejection email AFTER transaction commits
    try {
      this.logger.log(
        `Sending seller rejection email to ${result.email.email}`,
      );

      await this.mailService.sendSellerRejectionEmail(result.email);

      this.logger.log(
        `Seller rejection email accepted for ${result.email.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Seller rejection email failed for ${result.email.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return result.response;
  }
}
