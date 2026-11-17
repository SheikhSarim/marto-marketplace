import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { AuthType } from '../auth/enum/auth-type.enum';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Product Categories')
@Auth(AuthType.None)
@Controller()
export class CategoriesPublicController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('product-categories')
  @ApiOperation({ summary: 'Get active marketplace-wide product categories' })
  findPlatformCategories() {
    return this.categoriesService.findPublicPlatformCategories();
  }

  @Get('product-categories/tree')
  @ApiOperation({
    summary: 'Get active marketplace-wide product category tree',
  })
  getPlatformTree() {
    return this.categoriesService.getPublicPlatformTree();
  }

  @Get('product-categories/:id')
  @ApiOperation({ summary: 'Get an active marketplace-wide product category' })
  @ApiParam({ name: 'id', format: 'uuid' })
  findPlatformCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findPublicPlatformCategory(id);
  }

  @Get('shops/:shopId/product-categories')
  @ApiOperation({ summary: 'Get active custom collections for a public shop' })
  @ApiParam({ name: 'shopId', format: 'uuid' })
  findShopCollections(@Param('shopId', ParseUUIDPipe) shopId: string) {
    return this.categoriesService.getPublicShopCategoryTree(shopId);
  }
}
