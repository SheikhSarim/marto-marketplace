import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginSellerDto {
  @ApiProperty({
    example: 'seller@example.com',
    description: 'Seller account email address',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'YourStrongPassword123',
    description: 'Seller account password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}
