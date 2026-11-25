import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { User } from './entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { UserRole } from '../../common/enums/user-roles.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateUserDto } from '../dto/create-user.dto';
// import { CreateUserProvider } from '../providers/create-user.provider';/
import { FindUserByEmailProvider } from './providers/find-user-by-email.provider';
import { FindUserByIdProvider } from './providers/find-user-by-id.provider';
// import { CreateGoogleUserProvider } from '../providers/create-google-user.provider';
// import { CreateGoogleUserDto } from '../dto/create-google-user.dto';

// import { CompleteProfileDto } from '../dto/complete-profile.dto';
// import { Role } from '../../../common/enum/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    private readonly dataSource: DataSource,

    // private readonly createUserProvider: CreateUserProvider,
    private readonly findUserByEmailProvider: FindUserByEmailProvider,
    private readonly findUserByIdProvider: FindUserByIdProvider,
    // private readonly createGoogleUserProvider: CreateGoogleUserProvider,
  ) {}

  //   async createUser(createUserDto: CreateUserDto): Promise<User> {
  //     return this.createUserProvider.createUser(createUserDto);
  //   }

  async findUserByEmail(email: string): Promise<User> {
    return this.findUserByEmailProvider.findUserByEmail(email);
  }

  async findUserByEmailOrNull(email: string): Promise<User | null> {
    return this.findUserByEmailProvider.findUserByEmailOrNull(email);
  }

  async findUserById(id: number): Promise<User> {
    return this.findUserByIdProvider.findUserById(id);
  }

  async getMyProfile(userId: string, role: UserRole) {
    if (![UserRole.CUSTOMER, UserRole.SELLER].includes(role)) {
      throw new ForbiddenException(
        'Profile access is not allowed for this role',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId, role },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (role === UserRole.CUSTOMER) {
      const customer = await this.customerRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!customer) {
        throw new NotFoundException('Customer profile not found');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profile_pic: user.profile_pic,
        phone: customer.phone,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    }

    const seller = await this.sellerRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profile_pic: user.profile_pic,
      is_email_verified: user.is_email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  //   async createGoogleUser(dto: CreateGoogleUserDto): Promise<User> {
  //     return this.createGoogleUserProvider.createGoogleUser(dto);
  //   }

  //   async getMe(userId: number) {
  //     return this.userRepository.findOne({
  //       where: { id: userId },
  //       relations: {
  //         member: true,
  //         author: true,
  //       },
  //     });
  //   }

  //   async completeProfile(userId: number, dto: CompleteProfileDto) {
  //     if (!userId) throw new NotFoundException('Invalid user');

  //     const user = await this.userRepository.findOneBy({ id: userId });

  //     if (!user) throw new NotFoundException('User not found');

  //     if (user.role === Role.MEMBER) {
  //       await this.memberRepository.update({ user: { id: userId } }, dto);
  //     }

  //     if (user.role === Role.AUTHOR) {
  //       await this.authorRepository.update({ user: { id: userId } }, dto);
  //     }

  //     await this.userRepository.update(userId, {
  //       isProfileCompleted: true,
  //     });

  //     return this.getMe(userId);
  //   }
}
