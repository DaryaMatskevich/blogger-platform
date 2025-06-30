import { UserModelType } from '../../../../../modules/user-accounts/domain/dto/user.entity';
import { UserExternalDto } from './users.external-dto';
export declare class UsersExternalQueryRepository {
    private UserModel;
    constructor(UserModel: UserModelType);
    getByIdOrNotFoundFail(id: string): Promise<UserExternalDto>;
}
