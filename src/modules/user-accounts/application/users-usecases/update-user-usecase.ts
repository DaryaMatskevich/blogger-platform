import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateUserDto } from "../../dto/update-user.dto";
import { UsersRepository } from "../../infastructure/users.repository";

export class UpdateUserCommand {
    constructor(public id: string,
        public dto: UpdateUserDto
    ) { }
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase
    implements ICommandHandler<UpdateUserCommand> {
    constructor(
        private usersRepository: UsersRepository,
    ) { }

    async execute(command: UpdateUserCommand): Promise<string> {
        const user = await this.usersRepository.findOrNotFoundFail(command.id);

        // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
        // создаём метод
        user.update(command.dto); // change detection

        await this.usersRepository.save(user);

        return user._id.toString();
    }
}