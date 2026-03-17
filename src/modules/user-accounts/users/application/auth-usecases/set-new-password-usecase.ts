import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { CryptoService } from '../services/crypto.service';
import { ConfirmationRepository } from '../../../../../modules/user-accounts/users/infastructure/confirmation.repository';
import { UsersQueryRepository } from '../../../../../modules/user-accounts/users/infastructure/query/users.query-repository';
import { UsersRepository } from '../../../../../modules/user-accounts/users/infastructure/users.repository';

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
    console.log(command.recoveryCode);
    const confirmation =
      await this.confirmationRepository.findConfirmationByRecoveryCode(
        command.recoveryCode,
      );

    console.log(command.recoveryCode);
    if (!confirmation) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Recovery code not found',
        extensions: [new Extension('Recovery code not found', 'recoveryCode')],
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
        message: 'Recovery code expired',
        extensions: [new Extension('Recovery code expired', 'recoveryCode')],
      });
    }

    const isSamePassword = await this.cryptoService.checkPassword(
      command.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'New password must be different from current password',
        extensions: [
          new Extension(
            'New password must be different from current password',
            'newPassword',
          ),
        ],
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
