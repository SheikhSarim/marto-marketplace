
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Seller } from '../../sellers/entities/seller.entity';
import { Product } from '../../products/entities/product.entity';

import { CategoryStatus } from '../../../common/enums/category-status.enum';
import { DisabledBy } from '../../../common/enums/disable-by.enum';

@Entity({ name: 'categories' })
@Index('idx_categories_seller_status', ['seller', 'status'])
@Index('idx_categories_parent', ['parent'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Every category must belong to a seller.
  @ManyToOne(() => Seller, (seller) => seller.categories, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'seller_id',
    referencedColumnName: 'id',
  })
  seller!: Seller;

  // Parent category for nested categories.
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'parent_id',
    referencedColumnName: 'id',
  })
  parent!: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[];

  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 180,
  })
  slug!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  image_url!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  image_public_id!: string | null;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    enumName: 'category_status_enum',
    default: CategoryStatus.ACTIVE,
  })
  status!: CategoryStatus;

  @Column({
    type: 'enum',
    enum: DisabledBy,
    enumName: 'disabled_by_enum',
    nullable: true,
  })
  disabled_by!: DisabledBy | null;

  @Column({
    type: 'integer',
    default: 0,
  })
  sort_order!: number;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updated_at!: Date;
}
