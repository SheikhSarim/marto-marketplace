import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class VerifyEmailChangeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  token!: string;
}