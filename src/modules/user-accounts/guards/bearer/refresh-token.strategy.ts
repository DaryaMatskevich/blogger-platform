import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';


@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor() {
    super({
      // Извлекаем токен из cookies
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: 'refresh-token-secret', // Должен совпадать с REFRESH_TOKEN_SECRET
      passReqToCallback: true, // Для доступа к request в validate
    });
  }

  /**
   * Валидация payload из refresh token
   * @param req Объект запроса
   * @param payload Декодированные данные из токена
   */
  async validate(req: Request, payload: { userId: string; deviceId: string }): Promise<{ userId: string; deviceId: string }> {
    // Проверяем наличие обязательных полей
    if (!payload.userId || !payload.deviceId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid token payload',
      });
    }
    
    return {
      userId: payload.userId,
      deviceId: payload.deviceId
    };
  }
}