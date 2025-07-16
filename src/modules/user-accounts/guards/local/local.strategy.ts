import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { DomainExceptionCode } from '@src/core/exeptions/domain-exeption-codes';
import { DomainException } from '@src/core/exeptions/domain-exeptions';
import { UserContextDto } from '../dto/user-contex.dto';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'login' });
  }

  //validate возвращает то, что впоследствии будет записано в req.user
  async validate(username: string, password: string): Promise<UserContextDto> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid username or password',
      });
    }

    return user;
  }
}