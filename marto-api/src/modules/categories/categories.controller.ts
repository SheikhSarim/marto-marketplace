import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UserRole } from '../../common/enums/user-roles.enum';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { CategoriesService } from './categories.service';

@ApiTags('Seller Categories')
@ApiBearerAuth()
@Controller('seller/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  // CREATE CATEGORY
  @Post()
  @ApiOperation({
    summary: 'Create a seller category',
    description:
      'Creates a category under the authenticated seller. Seller account must be approved and have an active shop. Parent category, if provided, must belong to the same seller.',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category data or parent category.',
  })
  @ApiResponse({
    status: 403,
    description: 'Seller account is not approved or has no active shop.',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found.',
  })
  create(
    @Req() req: any,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(req.user.id, dto);
  }
}