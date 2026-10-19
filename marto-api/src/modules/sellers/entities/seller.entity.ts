import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { Order } from '../../orders/entities/order.entity';

import { SellerStatus } from '../../../common/enums/seller-status.enum';
import { PlatformFeeTransaction } from 'src/modules/platform-fees/entities/platform-fee-transaction.entity';

@Entity({ name: 'sellers' })
export class Seller {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Seller belongs to one User
  @OneToOne(() => User, (user) => user.seller, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user!: User;

  @Column({ type: 'varchar', length: 150 })
  business_name!: string;

  @Column({ type: 'varchar', length: 255 })
  business_email!: string;

  @Column({ type: 'varchar', length: 30 })
  business_phone!: string;

  @Column({ type: 'varchar', length: 100 })
  cnic!: string;

  @Column({ type: 'varchar', length: 255 })
  business_address!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({
    type: 'enum',
    enum: SellerStatus,
    enumName: 'seller_status_enum',
    default: SellerStatus.PENDING,
  })
  status!: SellerStatus;

  @Column({ default: false })
  approved!: boolean;

  // Seller can own multiple shops
  @OneToMany(() => Shop, (shop) => shop.seller)
  shops!: Shop[];

  // Seller can have multiple products
  @OneToMany(() => Product, (product) => product.seller)
  products!: Product[];

  // Only if Category supports seller-owned categories
  @OneToMany(() => Category, (category) => category.seller)
  categories!: Category[];

  // Seller can have multiple orders
  @OneToMany(() => Order, (order) => order.seller)
  orders!: Order[];

  // Seller can have multiple platform fee transactions
  @OneToMany(() => PlatformFeeTransaction, (transaction) => transaction.seller)
  platformFeeTransactions!: PlatformFeeTransaction[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
