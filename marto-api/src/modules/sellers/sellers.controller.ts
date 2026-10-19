import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { SellerApplicationStatusProvider } from './provider/seller-application-status.provider';
import { AuthType } from '../auth/enum/auth-type.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import { SellerApplicationStatusDto } from './dto/seller-application-status.dto';
import { SellersService } from './sellers.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-roles.enum';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('sellers')
export class SellersController {
  constructor(
    private readonly sellerApplicationStatusProvider: SellerApplicationStatusProvider,
    private readonly sellersService: SellersService,
  ) {}

  @Auth(AuthType.None)
  @Post('application/status')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestApplicationStatus(@Body() dto: SellerApplicationStatusDto) {
    return this.sellerApplicationStatusProvider.sendStatus(dto);
  }

  @Post(':sellerId/approve')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a pending seller application and activate its shop(s)',
  })
  @ApiParam({ name: 'sellerId', description: 'Seller application UUID' })
  @ApiResponse({ status: 200, description: 'Seller approved and shop activated.' })
  @ApiResponse({ status: 403, description: 'Only a Super Admin can approve sellers.' })
  async approveApplication(
    @Param('sellerId', new ParseUUIDPipe()) sellerId: string,
  ) {
    return this.sellersService.approveApplication(sellerId);
  }
}
