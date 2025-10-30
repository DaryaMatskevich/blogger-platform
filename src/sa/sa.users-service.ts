import { Injectable } from '@nestjs/common';
import { DomainException, Extension } from '../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../core/exeptions/domain-exeption-codes';
import { CreateUserDto } from '../modules/user-accounts/dto/create-user.dto';
import { UsersRepository } from '../modules/user-accounts/infastructure/users.repository';
import { CryptoService } from '../modules/user-accounts/application/services/crypto.service';
import { User } from '../modules/user-accounts/domain/dto/user.entity';

@Injectable()
export class SaUsersService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
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

    const user = User.createInstance(
      {
        login: dto.login,
        passwordHash: passwordHash,
        email: dto.email,
        confirmationCode: null,
      },
      { isAdminCreation: true },
    );

    const createdUserId = await this.usersRepository.createUser(user);

    return createdUserId;
  }
}
