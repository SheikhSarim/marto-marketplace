import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Auth } from './modules/auth/decorators/auth.decorator';
import { AuthType } from './modules/auth/enum/auth-type.enum';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Auth(AuthType.None)
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Public Health Check',
    description: 'Checks if the application is running and healthy.',
  })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  checkHealth() {
    return this.appService.getHealth();
  }
}
