import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { SessionsQueryRepository } from '../../../../modules/user-accounts/sessions/infrastructure/query/sessions.query-repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(private sessionsQueryRepository: SessionsQueryRepository) {
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
    console.log('попал коод');
    if (!payload.userId || !payload.deviceId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid token payload',
      });
    }
    console.log('первую прошел');
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token not found in cookies',
      });
    }
    console.log('refreshToken');
    const session = await this.sessionsQueryRepository.findByDeviceId(
      payload.deviceId,
    );

    //if (
    //!session ||
    // session.deletedAt !== null ||
    // session.userId !== payload.userId
    // ) {
    //console.log('вот и ошибка');
    //throw new DomainException({
    // code: DomainExceptionCode.Unauthorized,
    // message: 'Invalid or expired refresh token',
    //});
    //}
    console.log('🎯 Начало проверки session');

    // Временно убираем проверки по одной чтобы найти проблему
    if (!session) {
      console.log('❌ FAIL: !session');
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired refresh token',
      });
    }

    console.log('✅ PASS: session существует');

    if (session.deletedAt !== null) {
      console.log('❌ FAIL: session.deletedAt !== null');
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired refresh token',
      });
    }

    console.log('✅ PASS: session не удалена');

    if (session.userId !== payload.userId) {
      console.log('❌ FAIL: session.userId !== payload.userId');
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired refresh token',
      });
    }

    console.log('✅ PASS: userId совпадают');
    console.log('🎉 Все проверки пройдены!');
    console.log('проверка!');
    if (session.refreshToken !== refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired refresh token',
      });
    }
    console.log('проверка2!', session.refreshToken);
    return {
      userId: payload.userId,
      deviceId: payload.deviceId,
      refreshToken: refreshToken,
    };
  }
}
