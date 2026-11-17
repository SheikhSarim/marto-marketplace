import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductShopCategory } from './entities/product-shop-category.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, ProductShopCategory, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
