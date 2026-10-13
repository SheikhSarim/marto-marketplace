import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessTokenTtl: parseInt(process.env.JWT_ACCESS_TTL ?? '3600', 10),    // 1 hour
  refreshTokenTtl: parseInt(process.env.JWT_REFRESH_TTL ?? '86400', 10), // 1 day
}));
