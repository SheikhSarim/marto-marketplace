import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiConsumes,
  ApiPayloadTooLargeResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';

import { Request } from 'express';

import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { UserRole } from '../../common/enums/user-roles.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { FileInterceptor } from '@nestjs/platform-express';
import type { UploadedImageFile } from 'src/common/uploads/upload-file.type';

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

  private readonly logger = new Logger(UsersController.name);

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
    return this.usersService.getMyProfile(req.user.id, req.user.role);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update my profile',
    description:
      'Updates the authenticated Customer or Seller personal profile. Email and account role cannot be changed.',
  })
  @ApiOkResponse({
    description: 'Profile updated successfully.',
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
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid profile data.' })
  @ApiUnauthorizedResponse({ description: 'Authentication required.' })
  @ApiForbiddenResponse({ description: 'Access denied for this role.' })
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMyProfile(req.user.id, req.user.role, dto);
  }

  @Patch('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @ApiOperation({
    summary: 'Update my profile picture',
    description:
      'Uploads a new profile picture for the authenticated Customer or Seller.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Profile picture updated successfully.',
    schema: {
      example: {
        message: 'Profile picture updated successfully',
        profile_pic:
          'https://res.cloudinary.com/example/image/upload/profile.jpg',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid file or missing file.',
  })
  @ApiPayloadTooLargeResponse({
    description: 'File size exceeds the 5 MB limit.',
  })
  @ApiUnsupportedMediaTypeResponse({
    description: 'Only JPEG, PNG and WebP images are allowed.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required.' })
  @ApiForbiddenResponse({ description: 'Access denied for this role.' })
  async updateMyProfilePicture(
    @Req() req: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
          }),
        ],
      }),
    )
    file: UploadedImageFile,
  ) {
    this.logger.log(`Profile picture update requested by user: ${req.user.id}`);

    const result = await this.usersService.updateMyProfilePicture(
      req.user.id,
      req.user.role,
      file,
    );

    this.logger.log(
      `Profile picture updated successfully for user: ${req.user.id}`,
    );

    return result;
  }
}
