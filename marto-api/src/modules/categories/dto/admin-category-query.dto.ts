import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CategoryQueryDto } from './category-query.dto';
import { ProductCategoryScope } from '../../../common/enums/product-category-scope.enum';

export class AdminCategoryQueryDto extends CategoryQueryDto {
  @IsOptional()
  @IsEnum(ProductCategoryScope)
  scope?: ProductCategoryScope;

  @IsOptional()
  @IsUUID()
  shop_id?: string;

  @IsOptional()
  @IsUUID()
  seller_id?: string;
}
