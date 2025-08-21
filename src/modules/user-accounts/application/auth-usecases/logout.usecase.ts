import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { Inject } from "@nestjs/common";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from "../../constants/auth-tokens.inject-constants";
import { CryptoService } from "../services/crypto.service";
import { SessionRepository } from "../../security-devices/infrastructure/sessions.repository";


export class LogOutCommand {
    constructor(public userId: string,
        public deviceId: string,
   public refreshToken: string) {}
}

@CommandHandler(LogOutCommand)
export class LogOutUseCase
    implements ICommandHandler<LogOutCommand> {
    constructor(
        private cryptoService: CryptoService,
        private sessionsRepository: SessionRepository,
       
    ) { }


    async execute(command: LogOutCommand): Promise<void> {
       
        const refreshTokenHash = await this.cryptoService.hashToken(command.refreshToken)
        const session = await this.sessionsRepository.findByUserIdandDeviceId(command.userId, command.deviceId, refreshTokenHash)
console.log('сессия найдена')
session?.makeDeleted()
session?.save()
// const deleteSession = await this.sessionsRepository.deleteSessionById(command.deviceId, command.userId)
      console.log('сессия удалена')
    }
}