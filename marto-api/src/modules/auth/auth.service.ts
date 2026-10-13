// import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import type { Response } from 'express';

// import { User } from '../users/entities/user.entity';
// import { LoginAdminDto } from '../admin/dto/login-admin.dto';

// @Injectable()
// export class AuthService {
//   private readonly logger = new Logger(AuthService.name);

//   constructor(
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService,
//   ) {}

//   async loginAdmin(dto: LoginAdminDto, response: Response) {
//     const email = dto.email.trim().toLowerCase();

//     const user = await this.userRepository.findOne({
//       where: { email },
//     });

//     // Return the same error for unknown email and incorrect password.
//     if (!user || !user.password) {
//       throw new UnauthorizedException('Invalid email or password');
//     }

//     const passwordMatches = await bcrypt.compare(dto.password, user.password);

//     if (!passwordMatches) {
//       throw new UnauthorizedException('Invalid email or password');
//     }

//     // Only the Super Admin role can use this endpoint.
//     if (user.role !== 'SUPER_ADMIN' || user.status !== 'ACTIVE') {
//       throw new UnauthorizedException('Invalid email or password');
//     }

//     const payload = {
//       sub: user.id,
//       email: user.email,
//       role: user.role,
//     };

//     const accessSecret =
//       this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');

//     const refreshSecret =
//       this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

//     const [accessToken, refreshToken] = await Promise.all([
//       this.jwtService.signAsync(payload, {
//         secret: accessSecret,
//         expiresIn: '1h',
//       }),
//       this.jwtService.signAsync(payload, {
//         secret: refreshSecret,
//         expiresIn: '1d',
//       }),
//     ]);

//     const isProduction = process.env.NODE_ENV === 'production';

//     response.cookie('access_token', accessToken, {
//       httpOnly: true,
//       secure: isProduction,
//       sameSite: 'lax',
//       path: '/',
//       maxAge: 60 * 60 * 1000,
//     });

//     response.cookie('refresh_token', refreshToken, {
//       httpOnly: true,
//       secure: isProduction,
//       sameSite: 'lax',
//       path: '/api/v1/auth',
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     // Use the property name that actually exists in your User entity.
//     user.last_login_at = new Date();
//     await this.userRepository.save(user);

//     this.logger.log(`Super Admin login successful: ${user.id}`);

//     return {
//       message: 'Admin login successful',
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//       },
//     };
//   }
// }
