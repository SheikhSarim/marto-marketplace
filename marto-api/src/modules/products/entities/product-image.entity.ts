import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from './product.entity';

@Entity({ name: 'product_images' })
@Index('idx_product_images_product', ['product'])
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Product, (product) => product.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
  })
  product!: Product;

  @Column({
    type: 'varchar',
    length: 500,
  })
  url!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  public_id!: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_primary!: boolean;

  @Column({
    type: 'integer',
    default: 0,
  })
  sort_order!: number;
}