
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
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AdminService } from './admin.service';

import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-roles.enum';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { RejectSellerDto } from './dto/reject-seller.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET ALL SELLER APPLICATIONS
  @Get('sellers')
  @ApiOperation({
    summary: 'Get all seller applications',
    description:
      'Retrieves all seller applications with business details, user information, email verification status, associated shops, and application status. Accessible only to Super Admin.',
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
                status: 'PENDING',
              },
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only Super Admin can access seller applications.',
  })
  listSellers() {
    return this.adminService.listSellers();
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
        message:
          'Seller application approved and shop activated successfully.',
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
    description:
      'Seller application is not pending or has no associated shop.',
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
    description:
      'Invalid seller UUID or rejection reason validation failed.',
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
}
