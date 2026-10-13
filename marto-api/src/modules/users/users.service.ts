import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateUserDto } from '../dto/create-user.dto';
import { User } from './entities/user.entity';
// import { CreateUserProvider } from '../providers/create-user.provider';/
import { FindUserByEmailProvider } from './providers/find-user-by-email.provider';
import { FindUserByIdProvider } from './providers/find-user-by-id.provider';
// import { CreateGoogleUserProvider } from '../providers/create-google-user.provider';
// import { CreateGoogleUserDto } from '../dto/create-google-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import { CompleteProfileDto } from '../dto/complete-profile.dto';
// import { Role } from '../../../common/enum/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

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
