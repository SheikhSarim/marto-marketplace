import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Seller } from '../../sellers/entities/seller.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';
import { ProductShopCategory } from './product-shop-category.entity';

import { ProductStatus } from '../../../common/enums/product-status.enum';
import { DiscountType } from '../../../common/enums/discount-type.enum';
import { DisabledBy } from '../../../common/enums/disable-by.enum';

@Entity({ name: 'products' })
@Index('idx_products_seller_status', ['seller', 'status'])
@Index('idx_products_shop_status', ['shop', 'status'])
@Index('uq_products_shop_sku', ['shop', 'sku'], { unique: true })
@Index('idx_products_primary_category_status', ['primaryCategory', 'status'])
@Index('idx_products_seller_created', ['seller', 'created_at'])
@Index('idx_products_seller_price', ['seller', 'final_price'])
@Index('idx_products_status_price', ['status', 'final_price'])
@Index('idx_products_status_created', ['status', 'created_at'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Seller, (seller) => seller.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'seller_id',
    referencedColumnName: 'id',
  })
  seller!: Seller;

  @ManyToOne(() => Shop, (shop) => shop.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'shop_id',
    referencedColumnName: 'id',
  })
  shop!: Shop;

  // Every product must belong to exactly one marketplace-wide category.
  @ManyToOne(() => Category, (category) => category.primaryProducts, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'primary_category_id',
    referencedColumnName: 'id',
  })
  primaryCategory!: Category;

  @OneToMany(
    () => ProductShopCategory,
    (assignment) => assignment.product,
    { cascade: false },
  )
  shopCategoryAssignments!: ProductShopCategory[];

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  brand!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  slug!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
  })
  sku!: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  price!: number;

  @Column({
    type: 'enum',
    enum: DiscountType,
    enumName: 'discount_type_enum',
    default: DiscountType.NONE,
  })
  discount_type!: DiscountType;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  discount_value!: number;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  sale_starts_at!: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  sale_ends_at!: Date | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  final_price!: number;

  @Column({
    type: 'integer',
    default: 0,
  })
  stock_quantity!: number;

  @Column({
    type: 'integer',
    default: 5,
  })
  low_stock_threshold!: number;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  weight!: number | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_prepaid_only!: boolean;

  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  tags!: string[];

  @Column({
    type: 'enum',
    enum: ProductStatus,
    enumName: 'product_status_enum',
    default: ProductStatus.ACTIVE,
  })
  status!: ProductStatus;

  @Column({
    type: 'enum',
    enum: DisabledBy,
    enumName: 'disabled_by_enum',
    nullable: true,
  })
  disabled_by!: DisabledBy | null;

  @Column({
    type: 'numeric',
    precision: 2,
    scale: 1,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  rating_avg!: number;

  @Column({
    type: 'integer',
    default: 0,
  })
  rating_count!: number;

  @Column({
    type: 'integer',
    default: 0,
  })
  sold_count!: number;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images!: ProductImage[];
  
  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updated_at!: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  deleted_at!: Date | null;
}
