import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { CryptoService } from '../services/crypto.service';
import { ConfirmationRepository } from '../../../../modules/user-accounts/infastructure/confirmation.repository';
import { UsersQueryRepository } from '../../../../modules/user-accounts/infastructure/query/users.query-repository';
import { UsersRepository } from '../../../../modules/user-accounts/infastructure/users.repository';

export class SetNewPasswordCommand {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase
  implements ICommandHandler<SetNewPasswordCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersRepository: UsersRepository,
    private confirmationRepository: ConfirmationRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: SetNewPasswordCommand): Promise<void> {
    const confirmation =
      await this.confirmationRepository.findUserIdByRecoveryCode(
        command.recoveryCode,
      );
    if (!confirmation) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Not found',
      });
    }
    const user = await this.usersQueryRepository.getByIdRaw(
      confirmation.userId,
    );
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        extensions: [new Extension('User not found', 'userId')],
      });
    }

    if (
      confirmation.recoveryCodeExpiresAt &&
      confirmation.recoveryCodeExpiresAt < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad request',
      });
    }

    const isSamePassword = await this.cryptoService.checkPassword(
      command.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Password is invalid',
        extensions: [new Extension('Password is invalid', 'password')],
      });
    }

    const newPasswordHash = await this.cryptoService.createPasswordHash(
      command.newPassword,
    );

    const result = await this.usersRepository.updatePassword(
      user.id,
      newPasswordHash,
    );
    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad reauest',
        extensions: [],
      });
    }
    const isRecoveryCodeCleared =
      await this.confirmationRepository.clearRecoveryCode(user.id);

    if (!isRecoveryCodeCleared) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Failed to clear recovery code',
        extensions: [],
      });
    }
  }
}
