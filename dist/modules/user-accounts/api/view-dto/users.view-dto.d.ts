import { UserDocument } from "../../domain/dto/user.entity";
export declare class UserViewDto {
    id: string;
    login: string;
    email: string;
    createdAt: Date;
    static mapToView(user: UserDocument): UserViewDto;
}
