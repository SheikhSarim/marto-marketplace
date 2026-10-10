import {registerAs} from '@nestjs/config';

export default registerAs('environment', () => ({
  environment: process.env.ENV === 'development' ? "development" : "production",
}))