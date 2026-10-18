import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ApiLoggerInterceptor } from './common/interceptors/api-logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Cookie Parser
   * Allows access to cookies through req.cookies.
   */
  app.use(cookieParser());

  /**
   * CORS
   * Allows the future React/Next.js frontend to communicate
   * with the backend while supporting credentials/cookies.
   */
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  /**
   * Global Validation Pipe
   *
   * whitelist:
   * Removes properties that are not defined in the DTO.
   *
   * forbidNonWhitelisted:
   * Throws an error when unknown properties are sent.
   *
   * transform:
   * Automatically transforms request payloads into DTO instances.
   *
   * enableImplicitConversion:
   * Allows automatic conversion such as string -> number/boolean
   * where supported by the DTO metadata.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  /**
   * Global API Logger Interceptor
   *
   * Enable this once ApiLoggerInterceptor has been implemented.
   * The project requirements specify structured logging for
   * controller/API activity.
   */
  app.useGlobalInterceptors(new ApiLoggerInterceptor());

  /**
   * Swagger Configuration
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Marto Marketplace API')
    .setDescription(
      `
Marto Marketplace Backend REST API

A scalable multi-vendor e-commerce marketplace backend built with
NestJS, PostgreSQL and TypeORM.

Core Features:
• Customer authentication and account management
• Seller onboarding and approval workflow
• Shop management
• Product and category management
• Customer addresses
• Single-seller shopping cart
• Checkout and order management
• Payment management
• Platform transaction fees
• Customer reviews and ratings
• Platform settings
• Seller revenue tracking
• Super Admin marketplace governance
• Platform revenue and GMV tracking
• Role-based access control (RBAC)
• JWT authentication
• Input validation
• Audit logging
• Pagination, filtering and search

Business Rules:
• Guests can browse public marketplace content.
• Authentication is required before checkout and order placement.
• Each order can contain products from only one seller.
• Sellers must be approved before selling.
• Sellers must own at least one shop.
• Disabled sellers, shops, products and categories are hidden from customers.
• Platform fee is configurable by Super Admin and defaults to PKR 10 per transaction.
• Historical order and financial records must remain intact after entity removal.
      `,
    )
    .setVersion('1.0.0')
    .setContact(
      'Marto Backend Engineering Team',
      'https://marto-online.com',
      '',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  /**
   * Swagger UI
   * http://localhost:3001/api
   */
  SwaggerModule.setup('api', app, document);

  /**
   * Swagger JSON
   * http://localhost:3001/api-json
   */
  app.getHttpAdapter().get('/api-json', (req, res) => {
    res.json(document);
  });

  /**
   * Start Application
   */
  const port = process.env.PORT ?? 3001;

  await app.listen(port, '0.0.0.0');

  console.log(`Marto Marketplace API running at: ${await app.getUrl()}`);
  console.log(`Swagger documentation: ${await app.getUrl()}/api`);
  console.log(`Swagger JSON: ${await app.getUrl()}/api-json`);
}

bootstrap();