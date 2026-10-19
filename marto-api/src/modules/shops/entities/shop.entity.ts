import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Seller } from '../../sellers/entities/seller.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';

export enum ShopStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

@Entity({ name: 'shops' })
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Seller, (seller) => seller.shops, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'seller_id', referencedColumnName: 'id' })
  seller!: Seller;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  // Broad category selected during seller onboarding (separate from product categories).
  @Column({ type: 'varchar', length: 120, nullable: true })
  category_name?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_image_url?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  contact_phone?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_email?: string | null;

  @Column({ type: 'text', nullable: true })
  delivery_information?: string | null;

  @Column({ type: 'enum', enum: ShopStatus, enumName: 'shop_status_enum', default: ShopStatus.ACTIVE })
  status!: ShopStatus;

  @OneToMany(() => Product, (product) => product.shop)
  products!: Product[];

  @OneToMany(() => Order, (order) => order.shop)
  orders!: Order[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
