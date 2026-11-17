import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post,
  Query, Req, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { UserRole } from '../../common/enums/user-roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CategoriesService } from './categories.service';

@ApiTags('Seller Product Collections')
@ApiBearerAuth()
@Controller('seller/shops/:shopId/product-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a custom product collection for an owned shop' })
  @ApiParam({ name: 'shopId', format: 'uuid' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Collection created.' })
  create(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.createShopCategory(req.user.id, shopId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated custom collections for an owned shop' })
  findAll(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Query() query: CategoryQueryDto,
  ) {
    return this.categoriesService.findShopCategories(req.user.id, shopId, query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get the custom collection tree for an owned shop' })
  getTree(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
  ) {
    return this.categoriesService.getShopCategoryTree(req.user.id, shopId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a custom collection' })
  findOne(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.findShopCategory(req.user.id, shopId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a custom collection' })
  @ApiBody({ type: UpdateCategoryDto })
  update(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateShopCategory(req.user.id, shopId, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Enable or disable a custom collection' })
  @ApiBody({ type: UpdateCategoryStatusDto })
  updateStatus(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryStatusDto,
  ) {
    return this.categoriesService.updateShopCategoryStatus(req.user.id, shopId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a custom collection without deleting products' })
  remove(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.removeShopCategory(req.user.id, shopId, id);
  }
}
