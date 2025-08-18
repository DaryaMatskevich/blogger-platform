import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { Inject } from "@nestjs/common";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from "../../constants/auth-tokens.inject-constants";
import { SessionRepository } from "../../security-devices/infrastructure/sessions.repository";
import { CryptoService } from "../services/crypto.service";


export class RefreshTokensCommand {
    constructor(public userId: string,
        public deviceId: string,
        public refreshToken: string) { }
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase
    implements ICommandHandler<RefreshTokensCommand> {
    constructor(
        private sessionsRepository: SessionRepository,
        private cryptoService: CryptoService,

        @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        private accessTokenContext: JwtService,

        @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
        private refreshTokenContext: JwtService,


    ) { }


    async execute(command: RefreshTokensCommand): Promise<{ newAccessToken: string, newRefreshToken: string }> {
        const refreshTokenHash = await this.cryptoService.hashToken(command.refreshToken)
        const session = await this.sessionsRepository.findByUserIdandDeviceId(command.userId, command.deviceId, refreshTokenHash)



        const now = new Date()
        session?.updateLastActiveDate(now)

        const newAccessToken = this.accessTokenContext.sign(
            { id: command.userId }

        );

        const newRefreshToken = this.refreshTokenContext.sign({
            id: command.userId,
            deviceId: command.deviceId
        })
        return {
            newAccessToken,
            newRefreshToken,
        };
    }
}