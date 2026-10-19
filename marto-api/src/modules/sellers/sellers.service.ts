import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seller } from './entities/seller.entity';
import { Shop, ShopStatus } from '../shops/entities/shop.entity';
import { SellerStatus } from '../../common/enums/seller-status.enum';

@Injectable()
export class SellersService {
  constructor(private readonly dataSource: DataSource) {}

  async approveApplication(sellerId: string) {
    return this.dataSource.transaction(async (manager) => {
      const sellerRepository = manager.getRepository(Seller);
      const shopRepository = manager.getRepository(Shop);

      const seller = await sellerRepository.findOne({
        where: { id: sellerId },
        relations: ['shops'],
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

      seller.status = SellerStatus.APPROVED;
      seller.approved = true;
      const savedSeller = await sellerRepository.save(seller);

      for (const shop of seller.shops) {
        shop.status = ShopStatus.ACTIVE;
        await shopRepository.save(shop);
      }

      return {
        success: true,
        message: 'Seller application approved and shop activated successfully.',
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
      };
    });
  }
}
