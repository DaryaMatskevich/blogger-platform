import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DomainExceptionCode } from "../../../../core/exeptions/domain-exeption-codes";
import { DomainException, Extension } from "../../../../core/exeptions/domain-exeptions";
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from "../../infastructure/users.repository";
import { EmailService } from "../../../../modules/notifications/email.service";

 export class SendPasswordRecoveryEmailCommand {
     constructor(public email: string,
        ) {}
 }
 
 @CommandHandler(SendPasswordRecoveryEmailCommand)
 export class SendPasswordRecoveryEmailUseCase
     implements ICommandHandler<SendPasswordRecoveryEmailCommand> {
     constructor(
         private emailService: EmailService,
         private usersRepository: UsersRepository,
     ) { }
 
 async execute(command: SendPasswordRecoveryEmailCommand) {

    const user = await this.usersRepository.findByEmail(command.email)

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with this email not found",
        extensions: [
          new Extension("Email is wrong", "email")
        ]
      })
    }

    const recoveryCode = uuidv4();
    user.setRecoveryCode(recoveryCode)
    await this.usersRepository.save(user);

    await this.emailService
      .sendPasswordRecoveryEmail(user.email, recoveryCode)
      .catch(console.error);
  }
}
