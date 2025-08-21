import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { Inject } from "@nestjs/common";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from "../../constants/auth-tokens.inject-constants";
import { CryptoService } from "../services/crypto.service";
import { SessionRepository } from "../../security-devices/infrastructure/sessions.repository";
import { DomainException } from "../../../../core/exeptions/domain-exeptions";
import { DomainExceptionCode } from "../../../../core/exeptions/domain-exeption-codes";


export class LogOutCommand {
    constructor(public userId: string,
        public deviceId: string,
        public refreshToken: string) { }
}

@CommandHandler(LogOutCommand)
export class LogOutUseCase
    implements ICommandHandler<LogOutCommand> {
    constructor(
        private cryptoService: CryptoService,
        private sessionsRepository: SessionRepository,

    ) { }


    async execute(command: LogOutCommand): Promise<void> {

        
        const session = await this.sessionsRepository.findByDeviceId(command.deviceId)
        console.log('сессия найдена')

        if(session.userId !== command.userId) { throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: "Forbidden"
              })}

        const isValid = await this.cryptoService.compareToken(
            
            command.refreshToken,
            session.refreshTokenHash
        );

        if (!isValid) {
            throw new DomainException({
                code: DomainExceptionCode.Unauthorized,
                message: "Unauthorized"
            })
        }
            if (isValid) {
                session.makeDeleted()
                await this.sessionsRepository.save(session)
            }

            // const deleteSession = await this.sessionsRepository.deleteSessionById(command.deviceId, command.userId)
            console.log(session)
        }
    }