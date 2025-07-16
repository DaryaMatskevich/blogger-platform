import { UserDocument } from "../../domain/dto/user.entity";
export declare class UserViewDto {
    id: string;
    login: string;
    email: string;
    createdAt: Date;
    static mapToView(user: UserDocument): UserViewDto;
}
declare const MeViewDto_base: import("@nestjs/common").Type<Omit<UserViewDto, "id" | "createdAt">>;
export declare class MeViewDto extends MeViewDto_base {
    userId: string;
    static mapToView(user: UserDocument): MeViewDto;
}
export {};
