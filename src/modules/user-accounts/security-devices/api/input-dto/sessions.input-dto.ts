import { Trim } from "../../../../../core/decorators/transform/trim";
import { IsString } from "class-validator";


//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreateSessionInputDto {

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
    deviceId: string;

}

