
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ProductStatus } from '../../../common/enums/product-status.enum';
import { ProductAvailability } from '../../../common/enums/product-availability.enum';
import { ProductSortBy } from '../../../common/enums/product-sort-by.enum';

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter products by product status.',
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Filter products by global platform category UUID.',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  primary_category_id?: string;

  @ApiPropertyOptional({
    description: 'Filter products by shop-specific collection UUID.',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  shop_category_id?: string;

  @ApiPropertyOptional({
    description: 'Filter products by availability.',
    enum: ProductAvailability,
  })
  @IsOptional()
  @IsEnum(ProductAvailability)
  availability?: ProductAvailability;

  @ApiPropertyOptional({
    description: 'Filter products with a minimum price.',
    type: Number,
    minimum: 0,
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({
    description: 'Filter products with a maximum price.',
    type: Number,
    minimum: 0,
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({
    description: 'Sort products by the selected field.',
    enum: ProductSortBy,
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  declare sortBy?: ProductSortBy;
}
