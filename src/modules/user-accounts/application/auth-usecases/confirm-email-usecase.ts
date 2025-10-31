import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { DataSource } from 'typeorm';
import { UsersRepository } from '../../../user-accounts/infastructure/users.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    private dataSource: DataSource,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: ConfirmEmailCommand) {
    const { code } = command;
    const user = await this.usersRepository.findUserByConfirmationCode(code);

    if (!user || user.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        extensions: [new Extension('Code is wrong', 'code')],
      });
    }
    if (user.confirmationCodeExpiresAt! < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad request',
      });
    }

    await this.dataSource.query(
      `UPDATE users 
       SET "isEmailConfirmed" = true, 
           "updatedAt" = NOW(),
           "confirmationCode" = NULL,
           "confirmationCodeExpiresAt" = NULL
       WHERE id = $1`,
      [user.id],
    );
  }
}
