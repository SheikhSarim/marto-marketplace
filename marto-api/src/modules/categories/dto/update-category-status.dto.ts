import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryStatus } from '../../../common/enums/category-status.enum';

export class UpdateCategoryStatusDto {
  @ApiProperty({
    description: 'The new status of the category',
    enum: CategoryStatus,
    example: CategoryStatus.ACTIVE, // Replace with a valid enum value from your CategoryStatus enum
  })
  @IsEnum(CategoryStatus)
  status!: CategoryStatus;
}