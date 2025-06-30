import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UserModelType } from '../../domain/dto/user.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
export declare class UsersQueryRepository {
    private UserModel;
    constructor(UserModel: UserModelType);
    getByIdOrNotFoundFail(id: string): Promise<UserViewDto>;
    getAll(query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>>;
}
