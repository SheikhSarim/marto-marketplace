import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ShopCategoriesService } from './shop-categories.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthType } from '../auth/enum/auth-type.enum';

@ApiTags('Shop Categories')
@Controller('shop-categories')
@Auth(AuthType.None)
export class ShopCategoriesPublicController {
  private readonly logger = new Logger(ShopCategoriesPublicController.name);

  constructor(private readonly shopCategoriesService: ShopCategoriesService) {}

  @Get('active')
  @ApiOperation({
    summary: 'Get active marketplace shop categories',
    description:
      'Returns active marketplace-level shop categories for seller registration. No authentication required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active shop categories retrieved successfully.',
  })
  async findActive() {
    this.logger.log('Request received to retrieve active shop categories.');

    return this.shopCategoriesService.findActive();
  }
}
