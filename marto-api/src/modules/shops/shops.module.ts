import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { UploadsModule } from 'src/common/uploads/uploads.module';
import { ShopCategory } from '../shop-categories/entities/shop-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, ShopCategory]), UploadsModule],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
