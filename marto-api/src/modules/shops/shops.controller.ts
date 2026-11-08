
import {
  Controller,
  Get,
  Req,
  UseGuards,
  Logger,
  Body,
  Patch,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

import { ShopsService } from './shops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-roles.enum';
import { UpdateShopDto } from './dto/update-shop.dto';

@ApiTags('Shops')
@ApiBearerAuth()
@Controller('shops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
export class ShopsController {
  private readonly logger = new Logger(ShopsController.name);

  constructor(private readonly shopsService: ShopsService) {}

  // GET MY SHOP
  @Get('me')
  @ApiOperation({
    summary: 'Get my shop details',
    description: 'Retrieves the authenticated seller’s shop details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop details retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing authentication token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only sellers can access this endpoint.',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found.',
  })
  async getMyShop(@Req() req: any) {
    const userId = req.user.id;

    this.logger.log(`Seller requested shop details. User ID: ${userId}`);

    return this.shopsService.getMyShop(userId);
  }

  // UPDATE MY SHOP
  @Patch('me')
  @ApiOperation({
    summary: 'Update my shop details',
    description:
      'Updates the authenticated seller’s shop information. Only the provided fields will be updated. Shop images and status cannot be changed through this endpoint.',
  })
  @ApiBody({
    type: UpdateShopDto,
    description: 'Provide the shop fields you want to update.',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop details updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or validation error.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing authentication token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only sellers can access this endpoint.',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found.',
  })
  async updateMyShop(@Req() req: any, @Body() dto: UpdateShopDto) {
    const userId = req.user.id;

    this.logger.log(`Seller updating shop details. User ID: ${userId}`);

    return this.shopsService.updateMyShop(userId, dto);
  }
}
