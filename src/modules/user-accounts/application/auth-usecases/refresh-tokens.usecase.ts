import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { Inject } from "@nestjs/common";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from "../../constants/auth-tokens.inject-constants";
import { SessionRepository } from "../../security-devices/infrastructure/sessions.repository";


export class RefreshTokensCommand {
    constructor(public userId: string,
        public deviceId: string) {}
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase
    implements ICommandHandler<RefreshTokensCommand> {
    constructor(
        private sessionsRepository: SessionRepository,
        
        @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        private accessTokenContext: JwtService,

        @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
        private refreshTokenContext: JwtService,

        
    ) { }


    async execute(command: RefreshTokensCommand): Promise<{ accessToken: string, refreshToken: string}> {
       const session =  this.sessionsRepository.findById(command.userId, command.deviceId)
       
        const accessToken = this.accessTokenContext.sign({
            id: command.userId
        });

        
        const refreshToken = this.refreshTokenContext.sign({
            id: command.userId,
            deviceId: command.deviceId
        })
        return {
            accessToken,
            refreshToken,
        };
    }
}