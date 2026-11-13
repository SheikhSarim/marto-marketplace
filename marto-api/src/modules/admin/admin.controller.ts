import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { AdminService } from './admin.service';

import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-roles.enum';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { RejectSellerDto } from './dto/reject-seller.dto';
import { AdminSellersQueryDto } from './dto/admin-sellers-query.dto';

import { SellerStatus } from '../../common/enums/seller-status.enum';
import { UpdateAdminShopStatusDto } from './dto/update-shop-status-byadmin.dto';
import { AdminShopsQueryDto } from './dto/admin-shops-query.dto';
import { ShopStatus } from 'src/common/enums/shop-status.enum';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET ALL SELLER APPLICATIONS
  @Get('sellers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get seller applications',
    description:
      'Retrieves seller applications with associated user and shop details. Supports pagination, search, status filtering, and sorting. Accessible only to Super Admin.',
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
    description: 'Number of records per page (default: 10).',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'Marto',
    description:
      'Search by business name, business email, seller name, or seller email.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SellerStatus,
    description: 'Filter seller applications by status.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: [
      'seller.created_at',
      'seller.business_name',
      'seller.business_email',
      'seller.status',
    ],
    example: 'seller.created_at',
    description: 'Field used to sort the results.',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    description: 'Sorting direction (default: DESC).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Seller applications retrieved successfully.',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            business_name: 'Marto Electronics',
            business_email: 'business@example.com',
            status: 'PENDING',
            approved: false,
            rejection_reason: null,
            created_at: '2026-10-20T10:30:00.000Z',
            user: {
              id: '650e8400-e29b-41d4-a716-446655440000',
              name: 'Ali Khan',
              email: 'ali@example.com',
              email_verified: true,
            },
            shops: [
              {
                id: '750e8400-e29b-41d4-a716-446655440000',
                name: 'Marto Electronics Store',
                status: 'DISABLED',
              },
            ],
          },
        ],
        meta: {
          total: 24,
          page: 1,
          limit: 10,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination, sorting, or status query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only Super Admin can access seller applications.',
  })
  listSellers(@Query() query: AdminSellersQueryDto) {
    return this.adminService.listSellers(query);
  }

  // APPROVE SELLER APPLICATION
  @Patch(':sellerId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve seller application',
    description:
      'Approves a pending seller application, activates all associated shops, updates the seller status to APPROVED, and triggers an approval notification email after the database transaction commits.',
  })
  @ApiParam({
    name: 'sellerId',
    description: 'UUID of the seller application to approve.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Seller application approved and associated shops activated.',
    schema: {
      example: {
        success: true,
        message: 'Seller application approved and shop activated successfully.',
        data: {
          seller: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            business_name: 'Marto Electronics',
            status: 'APPROVED',
            approved: true,
          },
          shops: [
            {
              id: '750e8400-e29b-41d4-a716-446655440000',
              name: 'Marto Electronics Store',
              status: 'ACTIVE',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid seller UUID.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only Super Admin can approve seller applications.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Seller application not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Seller application is not pending or has no associated shop.',
  })
  async approveApplication(
    @Param('sellerId', new ParseUUIDPipe()) sellerId: string,
  ) {
    return this.adminService.approveApplication(sellerId);
  }

  // REJECT SELLER APPLICATION
  @Patch(':sellerId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject seller application',
    description:
      'Rejects a pending seller application, saves the rejection reason, updates the seller status to REJECTED, and triggers a rejection notification email after the database transaction commits.',
  })
  @ApiParam({
    name: 'sellerId',
    description: 'UUID of the seller application to reject.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @ApiBody({
    type: RejectSellerDto,
    description: 'Reason for rejecting the seller application.',
    examples: {
      incompleteDocuments: {
        summary: 'Incomplete business documents',
        value: {
          reason: 'Your business registration documents are incomplete.',
        },
      },
      invalidInformation: {
        summary: 'Invalid business information',
        value: {
          reason: 'The submitted business information could not be verified.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Seller application rejected successfully.',
    schema: {
      example: {
        success: true,
        message: 'Seller application rejected successfully.',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          business_name: 'Marto Electronics',
          status: 'REJECTED',
          approved: false,
          rejection_reason:
            'Your business registration documents are incomplete.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid seller UUID or rejection reason validation failed.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only Super Admin can reject seller applications.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Seller application not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Only pending seller applications can be rejected.',
  })
  async rejectApplication(
    @Param('sellerId', new ParseUUIDPipe()) sellerId: string,
    @Body() dto: RejectSellerDto,
  ) {
    return this.adminService.rejectApplication(sellerId, dto.reason);
  }

  // LIST ALL SHOPS
  @Get('shops')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all shops',
    description:
      'Retrieves all marketplace shops with associated seller and user details. Supports pagination, search, status filtering, and sorting. Accessible only to Super Admin.',
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
    description: 'Number of records per page (default: 10).',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'Marto',
    description:
      'Search shops by shop name, seller business name, business email, or seller email.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ShopStatus,
    description:
      'Filter shops by status: ACTIVE, INACTIVE, SUSPENDED, or DISABLED.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['shop.created_at', 'shop.name', 'shop.status'],
    example: 'shop.created_at',
    description: 'Field used to sort the results.',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    description: 'Sorting direction (default: DESC).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shops retrieved successfully.',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '750e8400-e29b-41d4-a716-446655440000',
            name: 'Marto Electronics Store',
            status: 'ACTIVE',
            created_at: '2026-10-20T10:30:00.000Z',
            seller: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              business_name: 'Marto Electronics',
              business_email: 'business@example.com',
              status: 'APPROVED',
              user: {
                id: '650e8400-e29b-41d4-a716-446655440000',
                name: 'Ali Khan',
                email: 'ali@example.com',
                email_verified: true,
              },
            },
          },
          {
            id: '850e8400-e29b-41d4-a716-446655440000',
            name: 'Marto Accessories',
            status: 'SUSPENDED',
            created_at: '2026-10-19T09:15:00.000Z',
            seller: {
              id: '950e8400-e29b-41d4-a716-446655440000',
              business_name: 'Marto Electronics',
              business_email: 'business@example.com',
              status: 'APPROVED',
              user: {
                id: '650e8400-e29b-41d4-a716-446655440000',
                name: 'Ali Khan',
                email: 'ali@example.com',
                email_verified: true,
              },
            },
          },
        ],
        meta: {
          total: 24,
          page: 1,
          limit: 10,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination, sorting, or status query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only Super Admin can access shops.',
  })
  async listShops(@Query() query: AdminShopsQueryDto) {
    return this.adminService.listShops(query);
  }

  // UPDATE SHOP STATUS
  @Patch('shops/:shopId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update shop status',
    description:
      'Allows Super Admin to activate, deactivate, suspend, or disable any shop.',
  })
  @ApiParam({
    name: 'shopId',
    description: 'UUID of the shop.',
    type: String,
  })
  @ApiBody({
    type: UpdateAdminShopStatusDto,
    examples: {
      activate: {
        summary: 'Activate shop',
        value: { status: 'ACTIVE' },
      },
      deactivate: {
        summary: 'Deactivate shop',
        value: { status: 'INACTIVE' },
      },
      suspend: {
        summary: 'Suspend shop',
        value: { status: 'SUSPENDED' },
      },
      disable: {
        summary: 'Disable shop',
        value: { status: 'DISABLED' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shop status updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid shop UUID or status.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only Super Admin can update shop status.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Shop not found.',
  })
  async updateShopStatus(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Body() dto: UpdateAdminShopStatusDto,
  ) {
    return this.adminService.updateShopStatus(shopId, dto);
  }
}
