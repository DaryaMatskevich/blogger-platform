import { HydratedDocument, Model } from 'mongoose';
import { Name } from './name.schema';
import { CreateUserDomainDto } from './create-user.domain.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
export declare class User {
    login: string;
    passwordHash: string;
    email: string;
    isEmailConfirmed: boolean;
    name: Name;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    get id(): any;
    static createInstance(dto: CreateUserDomainDto): UserDocument;
    makeDeleted(): void;
    update(dto: UpdateUserDto): void;
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
