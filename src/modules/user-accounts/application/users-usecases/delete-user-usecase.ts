import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../infastructure/users.repository";

export class DeleteUserCommand {
  constructor(public id: string,
  ) { }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase
  implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
  ) { }
  
  async execute(command: DeleteUserCommand) {
    const user = await this.usersRepository.findOrNotFoundFail(command.id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}