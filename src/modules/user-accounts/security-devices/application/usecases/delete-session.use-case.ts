import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SessionRepository } from "../../infrastructure/sessions.repository";
import { DomainException } from "../../../../../core/exeptions/domain-exeptions";
import { DomainExceptionCode } from "../../../../../core/exeptions/domain-exeption-codes";

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

if (!session) {

      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Session not found"
      })
        
    }
    }}