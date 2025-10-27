import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingService } from './testing.service';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    // Защита от случайного вызова в продакшене
    if (process.env.NODE_ENV === 'production') {
      throw new Error('This endpoint is disabled in production');
    }

    await this.testingService.deleteAllData();
  }
}
