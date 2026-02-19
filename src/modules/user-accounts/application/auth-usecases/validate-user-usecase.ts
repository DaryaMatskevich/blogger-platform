import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../services/crypto.service';
import { UserContextDto } from '../../guards/dto/user-contex.dto';
import { UsersQueryRepository } from '@src/modules/user-accounts/infastructure/query/users.query-repository';

export class ValidateUserCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
  ) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(
    private cryptoService: CryptoService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: ValidateUserCommand): Promise<UserContextDto | null> {
    const { loginOrEmail, password } = command;
    const user =
      await this.usersQueryRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }
}
