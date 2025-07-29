import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { UserContextDto } from "../../guards/dto/user-contex.dto";

export class LoginCommand {
    constructor(public userId: string) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase
    implements ICommandHandler<LoginCommand> 
    {
    constructor(
        private jwtService: JwtService,
    ) {}


    async execute(command: LoginCommand) {
        const accessToken = this.jwtService.sign({ id: command.userId } as UserContextDto);

        return {
            accessToken,
        };
    }
}