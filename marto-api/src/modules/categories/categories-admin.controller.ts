import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post,
  Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminCategoryQueryDto } from './dto/admin-category-query.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-roles.enum';
import { ProductCategoryScope } from '../../common/enums/product-category-scope.enum';

@ApiTags('Admin Product Categories')
@ApiBearerAuth()
@Controller('admin/product-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class CategoriesAdminController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a marketplace-wide platform category' })
  @ApiBody({ type: CreateCategoryDto })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createPlatformCategory(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List platform and seller-owned product categories' })
  findAll(@Query() query: AdminCategoryQueryDto) {
    return this.categoriesService.findAdminCategories(query);
  }

  @Get('seller-categories')
  @ApiOperation({ summary: 'List seller-owned shop collections for moderation' })
  findSellerCategories(@Query() query: AdminCategoryQueryDto) {
    return this.categoriesService.findAdminCategories({ ...query, scope: ProductCategoryScope.SHOP });
  }

  @Delete('seller-categories/:id')
  @ApiOperation({ summary: 'Remove a seller-owned category as a moderation action' })
  @ApiParam({ name: 'id', format: 'uuid' })
  removeSellerCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.moderateRemoveShopCategory(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product category (platform or seller-owned)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findAdminCategory(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a platform category; seller category content is not editable by admin' })
  @ApiBody({ type: UpdateCategoryDto })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.updatePlatformCategory(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change platform category status' })
  @ApiBody({ type: UpdateCategoryStatusDto })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryStatusDto) {
    return this.categoriesService.updatePlatformCategoryStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-remove a platform category' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.removePlatformCategory(id);
  }

  @Patch('seller-categories/:id/status')
  @ApiOperation({ summary: 'Moderate a seller-owned category by disabling it' })
  @ApiParam({ name: 'id', format: 'uuid' })
  updateSellerCategoryStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryStatusDto,
  ) {
    return this.categoriesService.moderateShopCategoryStatus(id, dto);
  }
}
