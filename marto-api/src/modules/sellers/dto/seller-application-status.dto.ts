import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SellerApplicationStatusDto {
  @ApiProperty({
    description: 'Email address of the seller',
    example: 'seller@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  email!: string;
}
