import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { SellerStatus } from '../../../common/enums/seller-status.enum';

export class AdminSellersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SellerStatus)
  status?: SellerStatus;
}