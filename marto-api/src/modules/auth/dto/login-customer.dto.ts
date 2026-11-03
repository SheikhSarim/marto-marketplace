import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginCustomerDto {
  @ApiProperty({ example: 'sara@example.com' })
  @IsEmail() @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString() @IsNotEmpty() @MaxLength(128)
  password!: string;
}
