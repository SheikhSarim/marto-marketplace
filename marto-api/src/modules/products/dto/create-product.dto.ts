import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../../common/enums/discount-type.enum';

export class CreateProductDto {
  @ApiProperty({ example: 'Mechanical Gaming Keyboard' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'RGB mechanical keyboard with blue switches.' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  description?: string;

  @ApiPropertyOptional({ example: 'Logitech', maxLength: 100 })
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiProperty({ format: 'uuid', description: 'Mandatory marketplace-wide category ID.' })
  @IsUUID()
  primary_category_id!: string;

  @ApiPropertyOptional({ type: [String], description: 'Optional shop-owned collection IDs.' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  shop_category_ids?: string[];

  @ApiProperty({ example: 12000, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price!: number;

  @ApiPropertyOptional({ enum: DiscountType, default: DiscountType.NONE })
  @IsOptional()
  @IsEnum(DiscountType)
  discount_type?: DiscountType = DiscountType.NONE;

  @ApiPropertyOptional({ example: 10, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discount_value?: number = 0;

  @ApiPropertyOptional({ example: '2026-12-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  sale_starts_at?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  sale_ends_at?: string;

  @ApiPropertyOptional({ example: 25, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000000)
  stock_quantity?: number = 0;

  @ApiPropertyOptional({ example: 5, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000)
  low_stock_threshold?: number = 5;

  @ApiPropertyOptional({ example: 1.25, minimum: 0.01 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  weight?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  is_prepaid_only?: boolean = false;

  @ApiPropertyOptional({ type: [String], example: ['gaming', 'keyboard'] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
}
