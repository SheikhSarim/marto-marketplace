import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { Product } from './product.entity';
import { Category } from '../../categories/entities/category.entity';

/**
 * Join entity for assigning one product to multiple shop-owned collections.
 * The service layer must verify that product.shop.id === category.shop.id
 * and that category.scope === SHOP before inserting an assignment.
 */
@Entity({ name: 'product_shop_categories' })
@Index('idx_product_shop_categories_category', ['category'])
export class ProductShopCategory {
  @PrimaryColumn('uuid', { name: 'product_id' })
  productId!: string;

  @PrimaryColumn('uuid', { name: 'category_id' })
  categoryId!: string;

  @ManyToOne(() => Product, (product) => product.shopCategoryAssignments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product!: Product;

  @ManyToOne(() => Category, (category) => category.productAssignments, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category!: Category;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
