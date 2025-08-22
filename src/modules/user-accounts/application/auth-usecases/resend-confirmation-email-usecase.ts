import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EmailService } from "../../../../modules/notifications/email.service";
import { UsersRepository } from "../../infastructure/users.repository";
import { DomainException, Extension } from "../../../../core/exeptions/domain-exeptions";
import { DomainExceptionCode } from "../../../../core/exeptions/domain-exeption-codes";
import { v4 as uuidv4 } from 'uuid';

export class ResendConfirmationEmailCommand {
    constructor(public email: string,
       ) {}
}

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailUseCase
    implements ICommandHandler<ResendConfirmationEmailCommand> {
    constructor(
        private emailService: EmailService,
        private usersRepository: UsersRepository,
    ) { }


async execute(command: ResendConfirmationEmailCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(command.email)

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with this email not found",
        extensions: [
          new Extension("Email is wrong!", "email")
        ]
      })
    }

    if (user.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User is already confirmed",
        extensions: [
          new Extension("Email is confirmed", "email")
        ]
        
      })
    }
    const confirmCode = uuidv4();
    user.setConfirmationCode(confirmCode)
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
  }
}