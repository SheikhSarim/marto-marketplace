import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesAdminController } from './categories-admin.controller';
import { CategoriesPublicController } from './categories-public.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { Shop } from '../shops/entities/shop.entity';
import { ProductShopCategory } from '../products/entities/product-shop-category.entity';
import { PaginationModule } from '../../common/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, Seller, Shop, ProductShopCategory]), PaginationModule],
  controllers: [CategoriesPublicController, CategoriesController, CategoriesAdminController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
