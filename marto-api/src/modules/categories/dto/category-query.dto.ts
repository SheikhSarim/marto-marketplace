
import { Transform } from 'class-transformer';

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CategoryStatus } from '../../../common/enums/category-status.enum';

function parseBoolean(value: unknown): unknown {
  if (typeof value !== 'string') return value;

  const normalized = value.toLowerCase().trim();

  if (normalized === 'true') return true;
  if (normalized === 'false') return false;

  return value;
}

export class CategoryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  // Use parent_id=null to fetch root categories.
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  parent_id?: string;

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  root?: boolean;

  @IsOptional()
  @IsDateString()
  created_from?: string;

  @IsOptional()
  @IsDateString()
  created_to?: string;
}
