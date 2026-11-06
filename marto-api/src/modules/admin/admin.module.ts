import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Shop } from '../shops/entities/shop.entity';
import { MailModule } from '../mail/mail.module';
import { PaginationModule } from 'src/common/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Seller, Shop]),
    MailModule,
    PaginationModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
