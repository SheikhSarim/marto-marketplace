import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectSellerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;
}