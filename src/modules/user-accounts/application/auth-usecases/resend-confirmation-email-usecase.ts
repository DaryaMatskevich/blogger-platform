import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '../../../../modules/notifications/email.service';
import {
  DomainException,
  Extension,
} from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class ResendConfirmationEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailUseCase
  implements ICommandHandler<ResendConfirmationEmailCommand>
{
  constructor(
    private emailService: EmailService,
    private dataSource: DataSource,
  ) {}

  async execute(command: ResendConfirmationEmailCommand): Promise<void> {
    const { email } = command;

    // 1. Находим пользователя по email
    const userResult = await this.dataSource.query(
      `SELECT id, email, "isEmailConfirmed", "confirmationCode" 
       FROM users 
       WHERE email = $1`,
      [email],
    );

    if (userResult.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with this email not found',
        extensions: [new Extension('Email is wrong!', 'email')],
      });
    }

    const user = userResult[0];

    if (user.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User is already confirmed',
        extensions: [new Extension('Email is confirmed', 'email')],
      });
    }
    const confirmCode = uuidv4();

    await this.dataSource.query(
      `UPDATE users 
       SET "confirmationCode" = $1, "updatedAt" = NOW() 
       WHERE id = $2`,
      [confirmCode, user.id],
    );

    this.emailService.sendConfirmationEmail(user.email, confirmCode);
  }
}
