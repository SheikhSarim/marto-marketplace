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


}
