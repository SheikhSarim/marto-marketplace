import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ShopStatus } from '../../../common/enums/shop-status.enum';

export class UpdateAdminShopStatusDto {
  @ApiProperty({
    description: 'Shop status',
    enum: ShopStatus,
    example: ShopStatus.SUSPENDED,
  })
  @IsEnum(ShopStatus, {
    message: 'Invalid shop status.',
  })
  status!: ShopStatus;
}
