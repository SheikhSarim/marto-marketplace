import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class FindUserByIdProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findUserById(id: number): Promise<User> {
    let user: User | null = null;

    try {
      user = await this.usersRepository.findOne({
        where: { id: String(id) },
      });
    } catch {
      throw new RequestTimeoutException('Could not fetch user. Try again.');
    }

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }
}
