import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infastructure/users.repository';
import { CryptoService } from '../services/crypto.service';
import { UserContextDto } from '../../guards/dto/user-contex.dto';

export class ValidateUserCommand {
    constructor(public loginOrEmail: string,
        public password: string,) { }
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
    implements ICommandHandler<ValidateUserCommand> {
    constructor(
        private cryptoService: CryptoService,
        private usersRepository: UsersRepository,
    ) { }

    async execute(command: ValidateUserCommand
    ): Promise<UserContextDto | null> {
        const { loginOrEmail, password } = command
        const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

        if (!user) {
            return null
        }

        const isPasswordValid = await this.cryptoService.comparePasswords({
            password,
            hash: user.passwordHash,
        });

        if (!isPasswordValid) {
            return null
        }

        return { id: user._id.toString() };
    }
}