import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ShopStatus } from 'src/common/enums/shop-status.enum';

export class UpdateShopStatusDto {
  @ApiProperty({
    description: 'Shop status (Seller can only set ACTIVE or INACTIVE)',
    enum: [ShopStatus.ACTIVE, ShopStatus.INACTIVE],
    example: ShopStatus.ACTIVE,
  })
  @IsEnum(
    [ShopStatus.ACTIVE, ShopStatus.INACTIVE],
    {
      message: 'Seller can only set shop status to ACTIVE or INACTIVE',
    },
  )
  status!: ShopStatus;
}