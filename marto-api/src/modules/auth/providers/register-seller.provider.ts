import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { UploadedImageFile } from '../../../common/uploads/upload-file.type';

import { RegisterSellerDto } from '../dto/register-seller.dto';
import { HashProvider } from './hash.provider';
import { User } from '../../users/entities/user.entity';
import { Seller } from '../../sellers/entities/seller.entity';
import { Shop, ShopStatus } from '../../shops/entities/shop.entity';
import { UserRole } from '../../../common/enums/user-roles.enum';
import { SellerStatus } from '../../../common/enums/seller-status.enum';
import {
  CloudinaryUploadService,
  UploadedCloudinaryImage,
} from '../../../common/uploads/cloudinary-upload.service';
import { CLOUDINARY_FOLDERS } from 'src/common/uploads/path.constants';

@Injectable()
export class RegisterSellerProvider {
  constructor(
    private readonly dataSource: DataSource,
    private readonly hashProvider: HashProvider,
    private readonly cloudinaryUploadService: CloudinaryUploadService,
  ) {}

  async register(
    dto: RegisterSellerDto,
    files: {
      shop_logo?: UploadedImageFile[];
      shop_cover_image?: UploadedImageFile[];
    } = {},
  ) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.dataSource.getRepository(User).findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('This email is already registered.');
    }

    const hashedPassword = await this.hashProvider.hashPassword(dto.password);
    const uploadedImages: UploadedCloudinaryImage[] = [];

    try {
      const logoFile = files.shop_logo?.[0];
      const coverFile = files.shop_cover_image?.[0];

      const logo = logoFile
        ? await this.cloudinaryUploadService.uploadImage(
            logoFile,
            CLOUDINARY_FOLDERS.SHOP_LOGOS,
          )
        : null;
      if (logo) uploadedImages.push(logo);

      const cover = coverFile
        ? await this.cloudinaryUploadService.uploadImage(
            coverFile,
            CLOUDINARY_FOLDERS.SHOP_COVERS,
          )
        : null;
      if (cover) uploadedImages.push(cover);

      return await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(User);
        const sellerRepository = manager.getRepository(Seller);
        const shopRepository = manager.getRepository(Shop);

        const user = userRepository.create({
          name: dto.name.trim(),
          email,
          password: hashedPassword,
          role: UserRole.SELLER,
        });
        const savedUser = await userRepository.save(user);

        const seller = sellerRepository.create({
          user: savedUser,
          business_name: dto.business_name.trim(),
          business_email: dto.business_email.trim().toLowerCase(),
          business_phone: dto.business_phone.trim(),
          cnic: dto.cnic.trim(),
          business_address: dto.business_address.trim(),
          city: dto.city.trim(),
          status: SellerStatus.PENDING,
          approved: false,
        });
        const savedSeller = await sellerRepository.save(seller);

        // Keep the shop hidden until the seller application is approved.
        const shop = shopRepository.create({
          seller: savedSeller,
          name: dto.shop_name.trim(),
          description: dto.shop_description.trim(),
          category_name: dto.shop_category.trim(),
          logo_url: logo?.url ?? null,
          cover_image_url: cover?.url ?? null,
          address: dto.business_address.trim(),
          city: dto.city.trim(),
          contact_phone: dto.business_phone.trim(),
          contact_email: dto.business_email.trim().toLowerCase(),
          delivery_information: dto.delivery_information.trim(),
          status: ShopStatus.DISABLED,
        });
        const savedShop = await shopRepository.save(shop);

        return {
          success: true,
          message:
            'Seller application submitted successfully. Seller and shop details are awaiting admin approval.',
          data: {
            user: {
              id: savedUser.id,
              name: savedUser.name,
              email: savedUser.email,
              role: savedUser.role,
            },
            application: {
              id: savedSeller.id,
              business_name: savedSeller.business_name,
              status: savedSeller.status,
              approved: savedSeller.approved,
              created_at: savedSeller.created_at,
            },
            shop: {
              id: savedShop.id,
              name: savedShop.name,
              category: savedShop.category_name,
              logo_url: savedShop.logo_url,
              cover_image_url: savedShop.cover_image_url,
              status: savedShop.status,
              created_at: savedShop.created_at,
            },
          },
        };
      });
    } catch (error) {
      // Prevent orphaned Cloudinary files if registration/database work fails.
      await Promise.all(
        uploadedImages.map((image) =>
          this.cloudinaryUploadService.deleteImage(image.publicId),
        ),
      );
      throw error;
    }
  }
}
