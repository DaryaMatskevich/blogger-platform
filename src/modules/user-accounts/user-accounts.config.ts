import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../../core/config-validation.utility';

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string;
  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  accessTokenExpireInSeconds: number;

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  refreshTokenExpireInSeconds: number;

  constructor(private configService: ConfigService<any, true>) {
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');

    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');

    this.refreshTokenExpireInSeconds = this.parseTokenExpiration(
      configService.get('REFRESH_TOKEN_EXPIRE_IN'),
    );
    this.accessTokenExpireInSeconds = this.parseTokenExpiration(
      configService.get('ACCESS_TOKEN_EXPIRE_IN'),
    );

    configValidationUtility.validateConfig(this);
  }
  private parseTokenExpiration(expireIn: string): number {
    // Получаем последний символ (единицу измерения)
    const unit = expireIn.slice(-1);
    // Получаем числовое значение (все кроме последнего символа)
    const value = parseInt(expireIn.slice(0, -1), 10);

    // Проверяем, что число корректное
    if (isNaN(value)) {
      throw new Error(
        `Invalid token expiration format: "${expireIn}". Number expected before unit.`,
      );
    }

    // Конвертируем в секунды в зависимости от единицы измерения
    switch (unit) {
      case 's': // секунды
        return value;
      case 'm': // минуты
        return value * 60;
      case 'h': // часы
        return value * 60 * 60;
      case 'd': // дни
        return value * 24 * 60 * 60;
      default:
        // Если нет единицы измерения (просто число), возвращаем как есть
        if (!isNaN(parseInt(expireIn, 10))) {
          return parseInt(expireIn, 10);
        }
        throw new Error(
          `Invalid token expiration format: "${expireIn}". Use: 3600, 1h, 30m, 7d`,
        );
    }
  }
}
