import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../user-accounts/infastructure/users.repository';
import { CryptoService } from '../../user-accounts/application/services/crypto.service';
import { CreateUserInputDto } from '@src/modules/user-accounts/api/input-dto/users.input-dto';

@Injectable()
export class SaUsersService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}
  async createUserByAdmin(dto: CreateUserInputDto): Promise<number> {
    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const userId = await this.usersRepository.createUser({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    // Админ создает - сразу подтвержденный email
    await this.usersRepository.createConfirmation(
      {
        code: null,
        isEmailConfirmed: true,
      },
      userId,
    );

    return userId;
  }
}
