
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';

import { CategoryStatus } from '../../common/enums/category-status.enum';
import { CategorySortBy } from '../../common/enums/category-sort-by.enum';
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

  // GET ALL SELLER CATEGORIES
  @Get()
  @ApiOperation({
    summary: 'Get seller categories',
    description:
      'Returns paginated categories belonging only to the authenticated seller. Supports search, status, parent, creation date filters and sorting.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default: 1).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Records per page (default: 10, maximum: 100).',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'electronics',
    description: 'Search category name or slug.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: CategoryStatus,
    description: 'Filter categories by status.',
  })
  @ApiQuery({
    name: 'parent_id',
    required: false,
    type: String,
    example: 'null',
    description:
      'Filter by parent category UUID. Use "null" to get root categories.',
  })
  @ApiQuery({
    name: 'root',
    required: false,
    type: Boolean,
    example: true,
    description: 'When true, returns root categories only.',
  })
  @ApiQuery({
    name: 'created_from',
    required: false,
    type: String,
    example: '2026-01-01',
    description: 'Filter categories created from this date.',
  })
  @ApiQuery({
    name: 'created_to',
    required: false,
    type: String,
    example: '2026-12-31',
    description: 'Filter categories created up to this date.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: CategorySortBy,
    example: CategorySortBy.SORT_ORDER,
    description: 'Field used to sort categories.',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    example: 'ASC',
    description: 'Sorting direction.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories fetched successfully with pagination metadata.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters or date range.',
  })
  @ApiResponse({
    status: 403,
    description: 'Seller account is not approved or has no active shop.',
  })
  findAll(
    @Req() req: any,
    @Query() query: CategoryQueryDto,
  ) {
    return this.categoriesService.findAll(req.user.id, query);
  }

  // GET SINGLE SELLER CATEGORY
  @Get(':id')
  @ApiOperation({
    summary: 'Get category details',
    description:
      'Returns details of a category belonging to the authenticated seller, including parent, children and non-removed products count.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Category UUID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category UUID.',
  })
  @ApiResponse({
    status: 403,
    description: 'Seller account is not approved or has no active shop.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  findOne(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.findOne(req.user.id, id);
  }

  // UPDATE CATEGORY
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a seller category',
    description:
      'Updates an owned category name, description, parent category or sort order. Parent category must belong to the same seller. Removed categories cannot be updated. Slug remains unchanged when the name is updated.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Category UUID.',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully.',
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
    description: 'Category not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Removed category cannot be updated.',
  })
  update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(req.user.id, id, dto);
  }

  // UPDATE CATEGORY STATUS
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Enable or disable a seller category',
    description:
      'Changes an owned category status to ACTIVE or DISABLED. Sellers cannot activate categories disabled by admin. REMOVED status must be handled through the DELETE endpoint.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Category UUID.',
  })
  @ApiBody({ type: UpdateCategoryStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Category status updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status. REMOVED is not allowed here.',
  })
  @ApiResponse({
    status: 403,
    description: 'Category was disabled by admin and cannot be activated by seller.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Removed category cannot be activated or disabled.',
  })
  updateStatus(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryStatusDto,
  ) {
    return this.categoriesService.updateStatus(
      req.user.id,
      id,
      dto,
    );
  }

  // DELETE CATEGORY
  @Delete(':id')
  @ApiOperation({
    summary: 'Remove a seller category',
    description:
      'Soft removes an owned category by changing its status to REMOVED. Categories containing non-removed products cannot be removed.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Category UUID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category removed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category UUID.',
  })
  @ApiResponse({
    status: 403,
    description: 'Seller account is not approved or has no active shop.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Category already removed or contains non-removed products.',
  })
  remove(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.remove(req.user.id, id);
  }
}
