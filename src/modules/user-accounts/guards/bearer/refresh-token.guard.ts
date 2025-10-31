import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh-jwt') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    // Обрабатываем ошибки аутентификации
    if (err || !user) {
      let message = 'Unauthorized';

      if (info instanceof Error) {
        message = info.message;
      } else if (info && typeof info === 'string') {
        message = info;
      }

      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message,
      });
    }
    console.log('djn ');
    return user;
  }
}
