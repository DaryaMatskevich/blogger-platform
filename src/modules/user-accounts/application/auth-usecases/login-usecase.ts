import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { Inject } from "@nestjs/common";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from "../../constants/auth-tokens.inject-constants";


export class LoginCommand {
    constructor(public userId: string,
        public deviceId: string) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase
    implements ICommandHandler<LoginCommand> {
    constructor(
        
        @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        private accessTokenContext: JwtService,

        @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
        private refreshTokenContext: JwtService,

        
    ) { }


    async execute(command: LoginCommand): Promise<{ accessToken: string, refreshToken: string}> {
        console.log("что за херня " + command.userId)
        const accessToken = this.accessTokenContext.sign({
            id: command.userId
        });

        
        const refreshToken = this.refreshTokenContext.sign({
            userId: command.userId,
            deviceId: command.deviceId
        })
        return {
            accessToken,
            refreshToken,
        };
    }
}