import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ProductStatus } from '../../../common/enums/product-status.enum';

export class UpdateProductStatusDto {
  @ApiProperty({ enum: [ProductStatus.ACTIVE, ProductStatus.DISABLED] })
  @IsIn([ProductStatus.ACTIVE, ProductStatus.DISABLED])
  status!: ProductStatus.ACTIVE | ProductStatus.DISABLED;
}
