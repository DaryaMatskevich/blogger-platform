import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '../../../../modules/notifications/email.service';
import {
  DomainException,
  Extension,
} from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UsersQueryRepository } from '../../../../modules/user-accounts/infastructure/query/users.query-repository';
import { ConfirmationRepository } from '../../../../modules/user-accounts/infastructure/confirmation.repository';

export class ResendConfirmationEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailUseCase
  implements ICommandHandler<ResendConfirmationEmailCommand>
{
  constructor(
    private emailService: EmailService,
    private usersQueryRepository: UsersQueryRepository,
    private confirmationRepository: ConfirmationRepository,
    private dataSource: DataSource,
  ) {}

  async execute(command: ResendConfirmationEmailCommand): Promise<void> {
    const { email } = command;

    // 1. Находим пользователя по email
    const user = await this.usersQueryRepository.findByEmail(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with this email not found',
        extensions: [new Extension('Email is wrong!', 'email')],
      });
    }

    const confirmation =
      await this.confirmationRepository.findConfirmationByUserId(user.id);

    if (!confirmation) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Confirmation record not found',
        extensions: [new Extension('Confirmation not found', 'userId')],
      });
    }

    if (confirmation.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User is already confirmed',
        extensions: [new Extension('Email is confirmed', 'email')],
      });
    }
    const confirmCode = uuidv4();

    const updated = await this.confirmationRepository.updateConfirmationCode(
      user.id,
      confirmCode,
    );
    if (!updated) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Failed to update confirmation code. Please try again later.',
        extensions: [new Extension('Internal server error', 'email')],
      });
    }
    this.emailService.sendConfirmationEmail(user.email, confirmCode);
  }
}
