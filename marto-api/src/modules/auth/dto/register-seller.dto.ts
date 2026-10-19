import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterSellerDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the seller',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({
    example: 'seller@example.com',
    description: 'Seller account email address',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Account password (8–72 characters)',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({
    example: 'ABC Traders',
    description: 'Registered business name',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  business_name!: string;

  @ApiProperty({
    example: 'contact@abctraders.com',
    description: 'Business email address',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  business_email!: string;

  @ApiProperty({
    example: '+923001234567',
    description: 'Business contact phone number',
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  business_phone!: string;

  @ApiProperty({
    example: '3520212345671',
    description: 'Seller CNIC number',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cnic!: string;

  @ApiProperty({
    example: 'Shop 12, Main Boulevard, Gulberg',
    description: 'Complete business address',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  business_address!: string;

  @ApiProperty({
    example: 'Lahore',
    description: 'City where the business is located',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({
    example: 'ABC Traders Official Store',
    description: 'Name of the shop being submitted for approval',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  shop_name!: string;

  @ApiProperty({
    example: 'Everyday essentials and quality products from ABC Traders.',
    description: 'Description of the shop',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  shop_description!: string;

  @ApiProperty({
    example: 'General Store',
    description: 'Main category of the shop',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  shop_category!: string;

  @ApiProperty({
    example: 'Delivery available in Lahore within 2-4 business days.',
    description: 'Delivery information displayed to customers after approval',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  delivery_information!: string;

}
