
import {
  Controller,
  Get,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';

import { ShopsService } from './shops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-roles.enum';

@Controller('shops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
export class ShopsController {
  private readonly logger = new Logger(ShopsController.name);

  constructor(private readonly shopsService: ShopsService) {}

  @Get('me')
  async getMyShop(@Req() req: any) {
    const userId = req.user?.id;

    this.logger.log(`Seller requested their shop details. User ID: ${userId}`);

    return this.shopsService.getMyShop(userId);
  }
}
