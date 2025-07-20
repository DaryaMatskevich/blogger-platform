import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from './create-user.domain.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
export declare const loginConstraints: {
    minLength: number;
    maxLength: number;
};
export declare const passwordConstraints: {
    minLength: number;
    maxLength: number;
};
export declare const emailConstraints: {
    match: RegExp;
};
export declare class User {
    login: string;
    passwordHash: string;
    email: string;
    isEmailConfirmed: boolean;
    confirmationCode: string | null;
    confirmationCodeCreatedAt: Date | null;
    confirmationCodeExpiresAt: Date | null;
    recoveryCode: string | null;
    recoveryCodeCreatedAt: Date | null;
    recoveryCodeExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    get id(): any;
    static createInstance(dto: CreateUserDomainDto): UserDocument;
    makeDeleted(): void;
    setConfirmationCode(code: string): void;
    setRecoveryCode(code: string): void;
    confirmEmail(): void;
    update(dto: UpdateUserDto): void;
    setNewPasswordHash(newPasswordHash: string): void;
}
export declare const UserSchema: import("mongoose").Schema<User, Model<User, any, any, any, import("mongoose").Document<unknown, any, User, any> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<User>, {}> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
