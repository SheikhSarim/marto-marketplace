import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { UploadsModule } from 'src/common/uploads/uploads.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shop]), UploadsModule],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
