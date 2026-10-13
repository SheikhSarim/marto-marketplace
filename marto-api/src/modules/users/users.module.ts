import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Customer } from '../customers/entities/customer.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { FindUserByEmailProvider } from './providers/find-user-by-email.provider';
import { FindUserByIdProvider } from './providers/find-user-by-id.provider';

@Module({
  imports: [TypeOrmModule.forFeature([User, Customer, Seller])],
  controllers: [UsersController],
  providers: [
    UsersService,
    // CreateUserProvider,
    FindUserByEmailProvider,
    FindUserByIdProvider,
    // CreateGoogleUserProvider,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
