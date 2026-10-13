import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({
    example: 'admin@marto-online.com',
    description: 'Super Admin email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'YourStrongPassword123',
    description: 'Super Admin password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}
