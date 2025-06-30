import { UserDocument, UserModelType } from '../domain/dto/user.entity';
export declare class UsersRepository {
    private UserModel;
    constructor(UserModel: UserModelType);
    findById(id: string): Promise<UserDocument | null>;
    save(user: UserDocument): Promise<void>;
    findOrNotFoundFail(id: string): Promise<UserDocument>;
}
