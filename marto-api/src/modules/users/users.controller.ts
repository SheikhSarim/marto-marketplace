
import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Request } from 'express';

import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { UserRole } from '../../common/enums/user-roles.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER, UserRole.SELLER)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get my profile',
    description:
      'Returns the authenticated Customer or Seller personal profile.',
  })
  @ApiOkResponse({
    description: 'Profile retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        status: { type: 'string' },
        profile_pic: { type: 'string' },
        phone: {
          type: 'string',
          nullable: true,
          description: 'Available for Customer profiles only.',
        },
        is_email_verified: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required.' })
  @ApiForbiddenResponse({ description: 'Access denied for this role.' })
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMyProfile(
      req.user.id,
      req.user.role,
    );
  }
}
