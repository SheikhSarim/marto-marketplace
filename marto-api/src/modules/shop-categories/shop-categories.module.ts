import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShopCategory } from './entities/shop-category.entity';
import { ShopCategoriesController } from './shop-categories.controller';
import { ShopCategoriesService } from './shop-categories.service';
import { ShopCategoriesPublicController } from './shop-categories-public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShopCategory])],
  controllers: [ShopCategoriesController, ShopCategoriesPublicController],
  providers: [ShopCategoriesService],
  exports: [ShopCategoriesService],
})
export class ShopCategoriesModule {}
