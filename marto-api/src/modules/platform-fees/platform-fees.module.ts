import { Module } from '@nestjs/common';
import { PlatformFeesController } from './platform-fees.controller';
import { PlatformFeesService } from './platform-fees.service';

@Module({
  controllers: [PlatformFeesController],
  providers: [PlatformFeesService]
})
export class PlatformFeesModule {}
