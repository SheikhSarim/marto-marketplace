import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'CurrentPass123!',
    description: 'Your current password',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  current_password!: string;

  @ApiProperty({
    example: 'NewStrongPass123!',
    description: 'New password (8–72 characters)',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  new_password!: string;
}