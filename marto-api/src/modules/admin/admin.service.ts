import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { Seller } from '../sellers/entities/seller.entity';
import { Shop } from '../shops/entities/shop.entity';

import { ShopStatus } from 'src/common/enums/shop-status.enum';

import { SellerStatus } from '../../common/enums/seller-status.enum';
import { MailService } from '../mail/mail.service';
import { AdminSellersQueryDto } from './dto/admin-sellers-query.dto';
import { PaginationProvider } from 'src/common/providers/pagination.provider';
import { DisabledBy } from 'src/common/enums/disable-by.enum';
import { UpdateAdminShopStatusDto } from './dto/update-shop-status-byadmin.dto';
import { AdminShopsQueryDto } from './dto/admin-shops-query.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  // GET ALL SELLERS
  async listSellers(query: AdminSellersQueryDto) {
    const queryBuilder = this.dataSource
      .getRepository(Seller)
      .createQueryBuilder('seller')
      .innerJoinAndSelect('seller.user', 'user')
      .leftJoinAndSelect('seller.shops', 'shop');

    // Status filter
    if (query.status) {
      queryBuilder.andWhere('seller.status = :status', {
        status: query.status,
      });
    }

    const result = await this.paginationProvider.paginate(queryBuilder, query, {
      searchFields: [
        'seller.business_name',
        'seller.business_email',
        'user.name',
        'user.email',
      ],
      allowedSortFields: [
        'seller.created_at',
        'seller.business_name',
        'seller.business_email',
        'seller.status',
      ],
      defaultSortField: 'seller.created_at',
    });

    return {
      success: true,
      data: result.data.map((seller) => ({
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
      meta: result.meta,
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
        throw new NotFoundException('Seller application was not found.');
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
      this.logger.log(`Sending seller approval email to ${result.email.email}`);

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
        throw new NotFoundException('Seller application was not found.');
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

  //====================================================//
  //SHOP MANAGEMENT
  //====================================================//

  // LIST ALL SHOPS
  async listShops(query: AdminShopsQueryDto) {
    const shopRepository = this.dataSource.getRepository(Shop);

    const queryBuilder = shopRepository
      .createQueryBuilder('shop')
      .innerJoinAndSelect('shop.seller', 'seller')
      .innerJoinAndSelect('seller.user', 'user');

    if (query.status) {
      queryBuilder.andWhere('shop.status = :status', {
        status: query.status,
      });
    }

    const result = await this.paginationProvider.paginate(queryBuilder, query, {
      searchFields: [
        'shop.name',
        'shop.city',
        'seller.business_name',
        'seller.business_email',
        'user.name',
        'user.email',
      ],
      allowedSortFields: [
        'shop.created_at',
        'shop.name',
        'shop.city',
        'shop.status',
      ],
      defaultSortField: 'shop.created_at',
      secondarySortField: 'shop.id',
    });

    this.logger.log('Admin fetched shops listing.');

    return {
      success: true,
      data: result.data.map((shop) => ({
        id: shop.id,
        name: shop.name,
        logo_url: shop.logo_url,
        city: shop.city,
        status: shop.status,
        created_at: shop.created_at,
        disabled_by: shop.disabled_by,
        seller: {
          id: shop.seller.id,
          business_name: shop.seller.business_name,
          business_email: shop.seller.business_email,
          name: shop.seller.user.name,
          email: shop.seller.user.email,
        },
      })),
      meta: result.meta,
    };
  }

  // GET SHOP DETAILS
  async getShopDetails(shopId: string) {
    const shopRepository = this.dataSource.getRepository(Shop);

    const shop = await shopRepository.findOne({
      where: { id: shopId },
      relations: ['seller', 'seller.user'],
    });

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    this.logger.log(`Admin fetched details for shop ${shopId}.`);

    return {
      success: true,
      data: {
        id: shop.id,
        name: shop.name,
        description: shop.description,
        category_name: shop.category_name,
        logo_url: shop.logo_url,
        cover_image_url: shop.cover_image_url,
        address: shop.address,
        city: shop.city,
        contact_phone: shop.contact_phone,
        contact_email: shop.contact_email,
        opening_hours: shop.opening_hours,
        delivery_information: shop.delivery_information,
        status: shop.status,
        disabled_by: shop.disabled_by,
        created_at: shop.created_at,
        updated_at: shop.updated_at,

        seller: {
          id: shop.seller.id,
          business_name: shop.seller.business_name,
          business_email: shop.seller.business_email,
          business_phone: shop.seller.business_phone,
          business_address: shop.seller.business_address,
          city: shop.seller.city,
          status: shop.seller.status,
          approved: shop.seller.approved,
          created_at: shop.seller.created_at,
          updated_at: shop.seller.updated_at,

          user: {
            id: shop.seller.user.id,
            name: shop.seller.user.name,
            email: shop.seller.user.email,
            profile_pic: shop.seller.user.profile_pic,
            is_email_verified: shop.seller.user.is_email_verified,
            status: shop.seller.user.status,
            created_at: shop.seller.user.created_at,
            updated_at: shop.seller.user.updated_at,
          },
        },
      },
    };
  }

  // UPDATE SHOP STATUS
  async updateShopStatus(shopId: string, dto: UpdateAdminShopStatusDto) {
    const shopRepository = this.dataSource.getRepository(Shop);

    const shop = await shopRepository.findOne({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    shop.status = dto.status;

    shop.disabled_by =
      dto.status === ShopStatus.ACTIVE ? null : DisabledBy.ADMIN;

    const updatedShop = await shopRepository.save(shop);

    this.logger.log(`Admin updated shop ${shopId} status to ${dto.status}.`);

    return {
      success: true,
      message: 'Shop status updated successfully.',
      data: {
        id: updatedShop.id,
        name: updatedShop.name,
        status: updatedShop.status,
        disabled_by: updatedShop.disabled_by,
      },
    };
  }
}
