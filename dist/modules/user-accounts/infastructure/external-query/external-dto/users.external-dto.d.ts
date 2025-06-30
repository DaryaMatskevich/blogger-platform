import { UserDocument } from "src/modules/user-accounts/domain/dto/user.entity";
export declare class UserExternalDto {
    id: string;
    login: string;
    email: string;
    createdAt: Date;
    firstName: string;
    lastName: string | null;
    static mapToView(user: UserDocument): UserExternalDto;
}
