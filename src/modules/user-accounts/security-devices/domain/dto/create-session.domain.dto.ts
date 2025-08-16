import { Trim } from "../../../../../core/decorators/transform/trim";
import { IsDate, IsString } from "class-validator";


//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreateSessionDomainDto {

    @Trim()
    @IsString()
    userId: string;

    @Trim()
    @IsString()
    ip: string;

    @Trim()
    @IsString()
    title: string;

    @Trim()
    @IsString()
    lastActiveDate: string;

    @Trim()
    @IsString()
    deviceId: string;

    @Trim()
    @IsDate()
    expirationDate: Date;
}

