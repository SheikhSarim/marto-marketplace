import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { ShopsModule } from './modules/shops/shops.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { CartModule } from './modules/cart/cart.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PlatformFeesModule } from './modules/platform-fees/platform-fees.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PlatformSettingsModule } from './modules/platform-settings/platform-settings.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [AuthModule, UsersModule, SellersModule, ShopsModule, CategoriesModule, ProductsModule, AddressesModule, CartModule, CheckoutModule, OrdersModule, PaymentsModule, PlatformFeesModule, ReviewsModule, PlatformSettingsModule, AuditModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
