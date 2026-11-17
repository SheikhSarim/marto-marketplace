import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryStatus } from '../../../common/enums/category-status.enum';

export class UpdateCategoryStatusDto {
  @ApiProperty({ enum: [CategoryStatus.ACTIVE, CategoryStatus.DISABLED] })
  @IsIn([CategoryStatus.ACTIVE, CategoryStatus.DISABLED])
  status!: CategoryStatus;
}
