import { UserDocument, UserModelType } from '../domain/dto/user.entity';
export declare class UsersRepository {
    private UserModel;
    constructor(UserModel: UserModelType);
    findById(id: string): Promise<UserDocument | null>;
    save(user: UserDocument): Promise<void>;
    findOrNotFoundFail(id: string): Promise<UserDocument>;
    findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null>;
    findByLogin(login: string): Promise<UserDocument | null>;
    findByEmail(email: string): Promise<UserDocument | null>;
    loginIsExist(login: string): Promise<boolean>;
    findUserByConfirmationCode(code: string): Promise<UserDocument | null>;
    findUserByRecoveryCode(code: string): Promise<UserDocument | null>;
}
