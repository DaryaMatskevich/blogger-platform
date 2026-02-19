import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import {
  DomainException,
  Extension,
} from '../../../../core/exeptions/domain-exeptions';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../../../modules/notifications/email.service';
import { UsersQueryRepository } from '../../../../modules/user-accounts/infastructure/query/users.query-repository';
import { ConfirmationRepository } from '../../../../modules/user-accounts/infastructure/confirmation.repository';

export class SendPasswordRecoveryEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendPasswordRecoveryEmailCommand)
export class SendPasswordRecoveryEmailUseCase
  implements ICommandHandler<SendPasswordRecoveryEmailCommand>
{
  constructor(
    private emailService: EmailService,
    private usersQueryRepository: UsersQueryRepository,
    private confirmationRepository: ConfirmationRepository,
  ) {}

  async execute(command: SendPasswordRecoveryEmailCommand) {
    const user = await this.usersQueryRepository.findByEmail(command.email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with this email not found',
        extensions: [new Extension('Email is wrong', 'email')],
      });
    }

    const recoveryCode = uuidv4();

    const result = await this.confirmationRepository.setRecoveryCode(
      user.id,
      recoveryCode,
    );

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Failed to set recovery code',
        extensions: [],
      });
    }

    await this.emailService.sendPasswordRecoveryEmail(user.email, recoveryCode);
  }
}
