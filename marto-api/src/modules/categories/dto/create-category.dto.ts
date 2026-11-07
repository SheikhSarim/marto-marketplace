import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Electronics',
    maxLength: 150,
  })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the category',
    example: 'Various electronic devices, gadgets, and accessories.',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'The UUID of the parent category if it is a subcategory',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({
    description: 'The display sort order for the category',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;
}