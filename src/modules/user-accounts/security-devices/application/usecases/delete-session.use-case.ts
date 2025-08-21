import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SessionRepository } from "../../infrastructure/sessions.repository";
import { DomainException } from "../../../../../core/exeptions/domain-exeptions";
import { DomainExceptionCode } from "../../../../../core/exeptions/domain-exeption-codes";
import { CryptoService } from "../../../../../modules/user-accounts/application/services/crypto.service";

export class DeleteSessionCommand {
    constructor(public deviceId: string,
        public userId: string,
        public refreshToken: string
    ) { }
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
    implements ICommandHandler<DeleteSessionCommand> {
    constructor(
        private sessionRepository: SessionRepository,
        private cryptoService: CryptoService
    ) { }

    async execute(command: DeleteSessionCommand) {
        const session = await this.sessionRepository.findByUserIdandDeviceId(command.userId, command.deviceId)
 

        const isValid = await this.cryptoService.comparePasswords(
            
            command.refreshToken,
            session.refreshTokenHash
        );

        if (!isValid) {
            throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: "Forbidden"
            })
        }
session.makeDeleted()
await this.sessionRepository.save(session)

        
    }
    }