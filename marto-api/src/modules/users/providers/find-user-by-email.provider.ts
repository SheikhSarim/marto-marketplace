import {
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class FindUserByEmailProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // login ke liye — throws if not found
  async findUserByEmail(email: string): Promise<User> {
    let user: User | null = null;
    try {
      user = await this.usersRepository.findOne({ where: { email } });
    } catch {
      throw new RequestTimeoutException("Could not fetch user. Try again.");
    }
    if (!user) {
      throw new UnauthorizedException("User with this email does not exist.");
    }
    return user;
  }

  // google flow ke liye — null return karo agar nahi mila
  async findUserByEmailOrNull(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch {
      throw new RequestTimeoutException("Could not fetch user. Try again.");
    }
  }
}
