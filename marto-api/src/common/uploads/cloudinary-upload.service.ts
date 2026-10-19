import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import type { UploadedImageFile } from './upload-file.type';

export interface UploadedCloudinaryImage {
  url: string;
  publicId: string;
}

@Injectable()
export class CloudinaryUploadService {
  private readonly logger = new Logger(CloudinaryUploadService.name);

  constructor(private readonly configService: ConfigService) {}

  private configureCloudinary(): void {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Image upload is not configured. Please configure Cloudinary environment variables.',
      );
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  }

  async uploadImage(
    file: UploadedImageFile,
    folder: string,
  ): Promise<UploadedCloudinaryImage> {
    this.configureCloudinary();

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [
              { width: 2000, height: 2000, crop: 'limit' },
              { quality: 'auto:good', fetch_format: 'auto' },
            ],
          },
          (error, response) => {
            if (error || !response) {
              reject(error ?? new Error('Cloudinary returned an empty upload response.'));
              return;
            }
            resolve(response);
          },
        );

        stream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      this.logger.error(
        `Cloudinary image upload failed for folder "${folder}".`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Unable to upload image. Please try again.');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    this.configureCloudinary();
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
      this.logger.warn(
        `Cloudinary cleanup failed for asset "${publicId}".`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
