import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SellerApplicationStatusProvider } from './provider/seller-application-status.provider';
import { AuthType } from '../auth/enum/auth-type.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import { SellerApplicationStatusDto } from './dto/seller-application-status.dto';
import { SellersService } from './sellers.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-roles.enum';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('sellers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
export class SellersController {
  constructor(
    private readonly sellerApplicationStatusProvider: SellerApplicationStatusProvider,
  ) {}

  @Auth(AuthType.None)
  @Post('application/status')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestApplicationStatus(@Body() dto: SellerApplicationStatusDto) {
    return this.sellerApplicationStatusProvider.sendStatus(dto);
  }

}
