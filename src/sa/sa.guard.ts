import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing'); // 401
    }

    // Проверка Basic Auth
    const [type, credentials] = authHeader.split(' ');

    if (type !== 'Basic') {
      throw new UnauthorizedException('Invalid auth type'); // 401
    }

    const [username, password] = Buffer.from(credentials, 'base64')
      .toString()
      .split(':');

    // Здесь должна быть проверка учетных данных SA
    // Если неверные - бросаем 401
    if (username !== 'admin' || password !== 'qwerty') {
      throw new UnauthorizedException('Invalid credentials'); // 401
    }

    return true;
  }
}
