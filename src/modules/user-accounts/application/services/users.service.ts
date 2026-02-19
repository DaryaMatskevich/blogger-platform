import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infastructure/users.repository';
import { CryptoService } from './crypto.service';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../../../modules/notifications/email.service';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { CreateUserInputDto } from '../../../../modules/user-accounts/api/input-dto/users.input-dto';
import { ConfirmationRepository } from '../../../../modules/user-accounts/infastructure/confirmation.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private confirmationRepository: ConfirmationRepository,
    private cryptoService: CryptoService,
    private emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserInputDto): Promise<void> {
    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const confirmationCode = uuidv4();

    const user = {
      login: dto.login,
      email: dto.email,
      passwordHash: passwordHash,
    };

    const confirmation = {
      code: confirmationCode,
      isEmailConfirmed: false,
    };
    try {
      const userId = await this.usersRepository.createUser(user);

      await this.confirmationRepository.createConfirmation(
        confirmation,
        userId,
      );

      this.emailService.sendConfirmationEmail(user.email, confirmationCode);
    } catch (error) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: `Failed to create user: ${error.message}`,
      });
    }
  }
}
