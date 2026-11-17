import {
  Check,
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
import { Shop } from '../../shops/entities/shop.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductShopCategory } from '../../products/entities/product-shop-category.entity';

import { CategoryStatus } from '../../../common/enums/category-status.enum';
import { DisabledBy } from '../../../common/enums/disable-by.enum';
import { ProductCategoryScope } from '../../../common/enums/product-category-scope.enum';

/**
 * Unified ProductCategory model.
 *
 * Transitional compatibility:
 * - seller remains nullable so existing seller-owned category rows can be preserved.
 * - shop is nullable until legacy categories are mapped to their owning shops.
 * - Existing product.category_id relation is retained temporarily.
 * - New platform categories use scope=PLATFORM and no seller/shop owner.
 * - New shop collections use scope=SHOP and a shop owner.
 *
 * Ownership consistency is validated in the service layer during this transition.
 */
@Entity({ name: 'categories' })
@Check(
  'chk_categories_scope_owner',
  `(("scope" = 'PLATFORM' AND "shop_id" IS NULL AND "seller_id" IS NULL) OR ("scope" = 'SHOP' AND ("shop_id" IS NOT NULL OR "seller_id" IS NOT NULL)))`,
)
@Index('idx_categories_seller_status', ['seller', 'status'])
@Index('idx_categories_shop_status', ['shop', 'status'])
@Index('idx_categories_scope_status', ['scope', 'status'])
@Index('idx_categories_parent', ['parent'])
@Index('idx_categories_scope_parent', ['scope', 'parent'])
@Index('idx_categories_scope_slug', ['scope', 'slug'])
@Index('idx_categories_shop_slug', ['shop', 'slug'])
@Index('uq_categories_platform_slug', ['slug'], { unique: true, where: `"scope" = 'PLATFORM'` })
@Index('uq_categories_shop_slug', ['shop', 'slug'], { unique: true, where: `"scope" = 'SHOP' AND "shop_id" IS NOT NULL` })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: ProductCategoryScope,
    enumName: 'product_category_scope_enum',
    default: ProductCategoryScope.SHOP,
  })
  scope!: ProductCategoryScope;

  // Legacy owner relation retained until existing seller categories are mapped.
  @ManyToOne(() => Seller, (seller) => seller.categories, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'seller_id',
    referencedColumnName: 'id',
  })
  seller!: Seller | null;

  // New owner relation for shop-scoped custom collections.
  @ManyToOne(() => Shop, (shop) => shop.productCategories, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'shop_id',
    referencedColumnName: 'id',
  })
  shop!: Shop | null;

  // Parent and child categories must share the same scope and owner.
  // This is validated by CategoryHierarchyProvider/service logic.
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

  // Legacy product.category_id relation retained during migration.
  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];

  // New mandatory marketplace classification (made NOT NULL after backfill).
  @OneToMany(() => Product, (product) => product.primaryCategory)
  primaryProducts!: Product[];

  // Optional seller-created collections assigned to products.
  @OneToMany(
    () => ProductShopCategory,
    (assignment) => assignment.category,
  )
  productAssignments!: ProductShopCategory[];

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updated_at!: Date;
}
