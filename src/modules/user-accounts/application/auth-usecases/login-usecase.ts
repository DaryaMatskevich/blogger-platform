import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { UserContextDto } from "../../guards/dto/user-contex.dto";
import { Inject } from "@nestjs/common";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from "../../constants/auth-tokens.inject-constants";
import { refCount } from "rxjs";

export class LoginCommand {
    constructor(public userId: string) { }
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


    async execute(command: LoginCommand) {
        const accessToken = this.accessTokenContext.sign({
            id: command.userId
        } as UserContextDto);

        const refreshToken = this.refreshTokenContext.sign({
            id: command.userId
        })
        return {
            accessToken,
            refreshToken
        };
    }
}