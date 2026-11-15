import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ShopCategoryStatus } from '../../../common/enums/shop-category-status.enum';

@Entity({ name: 'shop_categories' })
@Index('uq_shop_categories_slug', ['slug'], { unique: true })
@Index('idx_shop_categories_status_name', ['status', 'name'])
export class ShopCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 180 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_public_id!: string | null;

  @Column({
    type: 'enum',
    enum: ShopCategoryStatus,
    enumName: 'shop_category_status_enum',
    default: ShopCategoryStatus.ACTIVE,
  })
  status!: ShopCategoryStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
