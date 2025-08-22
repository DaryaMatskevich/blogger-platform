import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserDto } from "../../dto/create-user.dto";
import { DomainException, Extension } from "../../../../core/exeptions/domain-exeptions";
import { DomainExceptionCode } from "../../../../core/exeptions/domain-exeption-codes";
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from "../../../../modules/notifications/email.service";
import { UsersRepository } from "../../infastructure/users.repository";
import { UsersService } from "../users.service";

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto
  ) { }
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private usersService: UsersService
  ) { }



async execute(command: RegisterUserCommand): Promise<void> {
    const userWithTheSameLogin = await this.usersRepository.findByLogin(
      command.dto.login
    )
    if (userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with the same login already exists",
        extensions: [
          new Extension("User with the same login already exists", "login")
        ]
      })
    }
    const userWithTheSameEmail = await this.usersRepository.findByEmail(
      command.dto.email
    )
    if (userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with the same email already exists",
        extensions: [
          new Extension("User with the same email already exists", "email")
        ]
      })
    }

    const createdUserId = await this.usersService.createUser(command.dto);

    const confirmCode = uuidv4();

    const user = await this.usersRepository.findOrNotFoundFail(
      createdUserId
    );

    user.setConfirmationCode(confirmCode);
    await this.usersRepository.save(user);
    console.log('User registered successfully');

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
  }
}