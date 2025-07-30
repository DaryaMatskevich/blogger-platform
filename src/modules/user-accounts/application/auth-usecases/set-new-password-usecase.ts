import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../infastructure/users.repository";
import { DomainException, Extension } from "../../../../core/exeptions/domain-exeptions";
import { DomainExceptionCode } from "../../../../core/exeptions/domain-exeption-codes";
import { CryptoService } from "../services/crypto.service";

export class SetNewPasswordCommand {
    constructor(public newPassword: string, 
      public recoveryCode: string) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase
    implements ICommandHandler<SetNewPasswordCommand> 
    {
    constructor(
        private usersRepository: UsersRepository,
        private cryptoService: CryptoService
    ) {}

async execute(command: SetNewPasswordCommand): Promise<boolean | any> {
    const user = await this.usersRepository.findUserByRecoveryCode(command.recoveryCode)
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User not found",
       
      })
    }

    const isSamePassword = await this.cryptoService.checkPassword(command.newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Password is invalid",
        extensions: [
          new Extension("Password is invalid", "password")
        ]
      })
    }
    if (user.recoveryCodeExpiresAt && user.recoveryCodeExpiresAt < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Bad request",
       
      })
    }
    const newPasswordHash = await this.cryptoService.createPasswordHash(command.newPassword)

    user.setNewPasswordHash(newPasswordHash)
    await this.usersRepository.save(user);

    return user._id.toString();
  }
}