import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UsersRepository } from '../../infastructure/users.repository';
import { CryptoService } from './crypto.service';
import {
  DomainException,
  Extension,
} from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { User } from '../../../../modules/user-accounts/domain/dto/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../../../modules/notifications/email.service';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private emailService: EmailService,
  ) {}
  async createUser(dto: CreateUserDto): Promise<string> {
    const userWithTheSameLogin = await this.usersRepository.findByLogin(
      dto.login,
    );
    if (userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same login already exists',
        extensions: [
          new Extension('User with the same login already exists', 'login'),
        ],
      });
    }

    const userWithTheSameEmail = await this.usersRepository.findByEmail(
      dto.email,
    );
    if (userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same email already exists',
        extensions: [
          new Extension('User with the same email already exists', 'email'),
        ],
      });
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );
    const confirmationCode = uuidv4();

    const user = User.createInstance({
      login: dto.login,
      passwordHash: passwordHash,
      email: dto.email,
      confirmationCode: confirmationCode,
    });

    await this.usersRepository.createUser(user);

    this.emailService.sendConfirmationEmail(user.email, confirmationCode);
    return user.id.toString();
  }
}
