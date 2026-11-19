import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsPublicController } from './products-public.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductShopCategory } from './entities/product-shop-category.entity';
import { Category } from '../categories/entities/category.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { Shop } from '../shops/entities/shop.entity';
import { PaginationModule } from '../../common/pagination.module';
import { UploadsModule } from '../../common/uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, ProductShopCategory, Category, Seller, Shop]),
    PaginationModule,
    UploadsModule,
  ],
  controllers: [ProductsController, ProductsPublicController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
