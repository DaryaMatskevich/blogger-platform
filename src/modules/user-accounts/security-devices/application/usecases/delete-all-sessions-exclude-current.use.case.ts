import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SessionRepository } from "../../infrastructure/sessions.repository";

export class DeleteAllSessionsExcludeCurrentCommand {
    constructor(public userId: string,
        public deviceId: string
    ) { }
}

@CommandHandler(DeleteAllSessionsExcludeCurrentCommand)
export class DeleteAllSessionsExcludeCurrentUseCase
    implements ICommandHandler<DeleteAllSessionsExcludeCurrentCommand> {
    constructor(
        private sessionRepository: SessionRepository,
    ) { }

    async execute(command: DeleteAllSessionsExcludeCurrentCommand) {
        const session = await this.sessionRepository.deleteAllSessionsExcludeCurrent(command.userId, command.deviceId);




        ;
    }
}