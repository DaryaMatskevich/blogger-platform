import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { SessionRepository } from '../../sessions/infrastructure/sessions.repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(private sessionRepository: SessionRepository) {
    super({
      // Извлекаем токен из cookies
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
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
  async validate(
    req: Request,
    payload: { userId: string; deviceId: string },
  ): Promise<{ userId: string; deviceId: string; refreshToken: string }> {
    // Проверяем наличие обязательных полей
    console.log('🔄 RefreshTokenStrategy validate');
    console.log('📦 Payload:', payload);
    console.log('🍪 RefreshToken from cookies:', req.cookies?.refreshToken);

    if (!payload.userId || !payload.deviceId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid token payload',
      });
    }
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token not found in cookies',
      });
    }

    const session = await this.sessionRepository.findByDeviceId(
      payload.deviceId,
    );

    if (
      !session ||
      session.deletedAt !== null ||
      session.userId !== payload.userId
    ) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired refresh token',
      });
    }

    if (session.refreshToken !== refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired refresh token',
      });
    }

    return {
      userId: payload.userId,
      deviceId: payload.deviceId,
      refreshToken: refreshToken,
    };
  }
}
