import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SessionRepository } from "../../infrastructure/sessions.repository";

export class DeleteSessionCommand {
    constructor(public deviceId: string,
        public userId: string
    ) { }
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
    implements ICommandHandler<DeleteSessionCommand> {
    constructor(
        private sessionRepository: SessionRepository,
    ) { }

    async execute(command: DeleteSessionCommand) {
        const session = await this.sessionRepository.deleteSessionById(command.deviceId, command.userId);


        
    }
}