import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({ example: 'Sara Ahmed' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  full_name!: string;

  @ApiProperty({ example: 'sara@example.com' })
  @IsEmail() @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'StrongPass123!', minLength: 8, maxLength: 72 })
  @IsString() @MinLength(8) @MaxLength(72)
  password!: string;

  @ApiPropertyOptional({ example: '+923001234567' })
  @IsOptional() @IsString() @MaxLength(30)
  phone?: string;
}
