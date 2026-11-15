import {
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserRole } from '../../common/enums/user-roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { CreateShopCategoryDto } from './dto/create-shop-category.dto';
import { ShopCategoriesService } from './shop-categories.service';

@ApiTags('Admin Shop Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin/shop-categories')
export class ShopCategoriesController {
  private readonly logger = new Logger(ShopCategoriesController.name);

  constructor(private readonly shopCategoriesService: ShopCategoriesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a marketplace shop category',
    description:
      'Creates a marketplace-level shop category. Only Super Admin can manage these categories.',
  })
  @ApiBody({ type: CreateShopCategoryDto })
  @ApiResponse({ status: 201, description: 'Shop category created.' })
  @ApiResponse({ status: 400, description: 'Invalid category name.' })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({ status: 403, description: 'Super Admin access required.' })
  @ApiResponse({ status: 409, description: 'Category name already exists.' })
  async create(@Body() dto: CreateShopCategoryDto) {
    this.logger.log(`Creating shop category. Name: ${dto.name}`);
    return this.shopCategoriesService.create(dto);
  }
}
