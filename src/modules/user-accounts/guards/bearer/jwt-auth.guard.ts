import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      console.log('ку-ку');
      // здесь можно выбросить любую свою ошибку
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    console.log('а вот и я');
    return user;
  }
}
