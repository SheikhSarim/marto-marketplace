import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Raw reset token from the email link' })
  @IsString() @MinLength(20) @MaxLength(256)
  token!: string;

  @ApiProperty({ example: 'NewStrongPass123!', minLength: 8, maxLength: 72 })
  @IsString() @MinLength(8) @MaxLength(72)
  password!: string;
}
