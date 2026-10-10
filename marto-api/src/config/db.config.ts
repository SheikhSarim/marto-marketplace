import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT || 5432),
  autoLoadEntities: process.env.DATABASE_AUTOLOAD_ENTITIES === 'true',
  synchronize: process.env.DATABASE_SYNC === 'true',
}));
