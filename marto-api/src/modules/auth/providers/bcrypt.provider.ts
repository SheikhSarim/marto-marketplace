import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashProvider } from './hash.provider';

@Injectable()
export class BcryptProvider implements HashProvider {
  async hashPassword(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  async comparePassword(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
