import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateShopDto {
  @ApiPropertyOptional({
    example: 'Trendy Wear Official Store',
    description: 'Shop name.',
    maxLength: 150,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    example: 'Fashion and clothing store offering quality products.',
    description: 'Shop description.',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    example: 'Fashion & Clothing',
    description: 'Shop category name.',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  category_name?: string | null;

  @ApiPropertyOptional({
    example: 'Shop 25, MM Alam Road, Gulberg III',
    description: 'Shop address.',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string | null;

  @ApiPropertyOptional({
    example: 'Lahore',
    description: 'Shop city.',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string | null;

  @ApiPropertyOptional({
    example: '+923211234567',
    description: 'Shop contact phone number.',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  contact_phone?: string | null;

  @ApiPropertyOptional({
    example: 'info@trendywear.com',
    description: 'Shop contact email.',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contact_email?: string | null;

  @ApiPropertyOptional({
    example: {
      monday: {
        open: '09:00',
        close: '21:00',
        is_closed: false,
      },
      sunday: {
        open: '',
        close: '',
        is_closed: true,
      },
    },
    description: 'Shop opening hours for each day.',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  opening_hours?: Record<
    string,
    {
      open: string;
      close: string;
      is_closed?: boolean;
    }
  > | null;

  @ApiPropertyOptional({
    example: 'We deliver all over Pakistan within 3-5 business days.',
    description: 'Shop delivery information.',
  })
  @IsOptional()
  @IsString()
  delivery_information?: string | null;
}
