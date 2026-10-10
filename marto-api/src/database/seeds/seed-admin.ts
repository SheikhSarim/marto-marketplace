import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../../app.module';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from 'src/common/enums/user-roles.enum';
import { UserStatus } from '../../common/enums/user-status.enum';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));

    const existingUser = await usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.role !== UserRole.SUPER_ADMIN) {
        throw new Error('This email already belongs to a non-admin user.');
      }

      console.log('Super Admin already exists. No changes made.');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = usersRepository.create({
      email,
      password: passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      is_email_verified: true,
      last_login_at: null,
    });

    await usersRepository.save(admin);

    console.log(`Super Admin created: ${email}`);
  } finally {
    await app.close();
  }
}

seedAdmin().catch((error) => {
  console.error('Super Admin seed failed:', error);
  process.exitCode = 1;
});
