import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { UserContextDto } from "../../guards/dto/user-contex.dto";
import { Inject } from "@nestjs/common";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from "../../constants/auth-tokens.inject-constants";


export class LoginCommand {
    constructor(public dto: {userId: string}) { }
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


    async execute({dto}: LoginCommand): Promise<{ accessToken: string, refreshToken: string }> {
        console.log("что за херня " + dto.userId)
        const accessToken = this.accessTokenContext.sign({
            id: dto.userId
        });

        const refreshToken = this.refreshTokenContext.sign({
            id: dto.userId
        })
        return {
            accessToken,
            refreshToken
        };
    }
}