import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Shop } from './entities/shop.entity';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async getMyShop(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID is missing.');
    }

    const shop = await this.shopRepository.findOne({
      where: {
        seller: {
          user: {
            id: userId,
          },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    return shop;
  }

  async updateMyShop(userId: string, dto: UpdateShopDto) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID is missing.');
    }

    const shop = await this.shopRepository.findOne({
      where: {
        seller: {
          user: {
            id: userId,
          },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    Object.assign(shop, dto);

    return this.shopRepository.save(shop);
  }
}
