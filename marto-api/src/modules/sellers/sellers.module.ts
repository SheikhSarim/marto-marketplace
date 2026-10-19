import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Seller } from './entities/seller.entity';
import { User } from '../users/entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Order } from '../orders/entities/order.entity';

import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { SellerApplicationStatusProvider } from './provider/seller-application-status.provider';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Seller, User, Shop, Product, Category, Order]),
    MailModule,
  ],
  controllers: [SellersController],
  providers: [SellersService, SellerApplicationStatusProvider],
  exports: [SellersService, TypeOrmModule],
})
export class SellersModule {}
