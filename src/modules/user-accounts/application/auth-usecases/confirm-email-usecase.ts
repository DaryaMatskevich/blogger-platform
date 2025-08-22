import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "../../infastructure/users.repository"
import { DomainException, Extension } from "../../../../core/exeptions/domain-exeptions"
import { DomainExceptionCode } from "../../../../core/exeptions/domain-exeption-codes"

export class ConfirmEmailCommand {
  constructor(public code: string,
  ) { }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand> {
  constructor(
    private usersRepository: UsersRepository,
  ) { }



  async execute(command: ConfirmEmailCommand) {
    let user = await this.usersRepository.findUserByConfirmationCode(command.code)

    if (!user || user.isEmailConfirmed) {

      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User not found",
        extensions: [
          new Extension("Code is wrong", "code")
        ]


      })
    }
    if (user.confirmationCodeExpiresAt! < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Bad request",

      })
    };

  

    if (user.confirmationCode !== command.code)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Bad requet",
        extensions: [
          new Extension("Code is wrong", "code")
        ]
      })
    user.confirmEmail()
    await this.usersRepository.save(user);
  }
}