import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { ConfirmationRepository } from '../../../../modules/user-accounts/infastructure/confirmation.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private confirmationRepository: ConfirmationRepository) {}

  async execute(command: ConfirmEmailCommand) {
    const { code } = command;
    const confirmation =
      await this.confirmationRepository.findUserByConfirmationCode(code);

    if (!confirmation || confirmation.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad request',
        extensions: [new Extension('Code is wrong', 'code')],
      });
    }

    const confirmed = await this.confirmationRepository.confirmEmail(
      confirmation.userId,
    );

    if (!confirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email confirmation failed',
        extensions: [
          new Extension('User not found or already confirmed', 'userId'),
        ],
      });
    }
  }
}
