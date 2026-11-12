
import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ShopStatus } from '../../../common/enums/shop-status.enum';

export class AdminShopsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ShopStatus)
  status?: ShopStatus;
}
