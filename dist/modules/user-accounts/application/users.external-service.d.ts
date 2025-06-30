import { UserModelType } from '../domain/dto/user.entity';
import { UsersRepository } from '../infastructure/users.repository';
export declare class UsersExternalService {
    private UserModel;
    private usersRepository;
    constructor(UserModel: UserModelType, usersRepository: UsersRepository);
    makeUserAsSpammer(userId: string): Promise<void>;
}
