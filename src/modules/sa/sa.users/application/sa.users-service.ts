import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../user-accounts/users/infastructure/users.repository';
import { CryptoService } from '../../../user-accounts/users/application/services/crypto.service';
import { CreateUserInputDto } from '../../../user-accounts/users/api/input-dto/users.input-dto';
import { ConfirmationRepository } from '../../../user-accounts/users/infastructure/confirmation.repository';

@Injectable()
export class SaUsersService {
  constructor(
    private usersRepository: UsersRepository,
    private confirmationRepository: ConfirmationRepository,
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
    await this.confirmationRepository.createConfirmation(
      {
        code: null,
        isEmailConfirmed: true,
        codeExpiresAt: null,
      },
      userId,
    );

    return userId;
  }
}
