import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputUserDto } from '../../dto/input-user.dto';
import {
  DomainException,
  Extension,
} from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { UsersService } from '../services/users.service';
import { UsersQueryRepository } from '../../../../modules/user-accounts/infastructure/query/users.query-repository';

export class RegisterUserCommand {
  constructor(public dto: InputUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const { login, email } = command.dto;

    const existingUser = await this.usersQueryRepository.findByLoginAndEmail(
      login,
      email,
    );

    if (existingUser) {
      // Определяем, какое поле конфликтует
      if (existingUser.login === command.dto.login) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'User with the same login already exists',
          extensions: [
            new Extension('User with the same login already exists', 'login'),
          ],
        });
      }

      if (existingUser.email === command.dto.email) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'User with the same email already exists',
          extensions: [
            new Extension('User with the same email already exists', 'email'),
          ],
        });
      }
    }

    await this.usersService.createUser(command.dto);
  }
}
