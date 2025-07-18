import { UserDocument } from "../../../../../modules/user-accounts/domain/dto/user.entity";
export declare class UserExternalDto {
    id: string;
    login: string;
    email: string;
    createdAt: Date;
    static mapToView(user: UserDocument): UserExternalDto;
}
