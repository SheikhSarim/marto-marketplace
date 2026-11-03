import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class EmailDto {
  @ApiProperty({ example: 'sara@example.com' })
  @IsEmail() @MaxLength(255)
  email!: string;
}
