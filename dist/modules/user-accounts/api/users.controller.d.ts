import { UserViewDto } from './view-dto/users.view-dto';
import { UsersService } from '../application/users.service';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UsersQueryRepository } from '../infastructure/query/users.query-repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view.dto';
export declare class UsersController {
    private usersQueryRepository;
    private usersService;
    constructor(usersQueryRepository: UsersQueryRepository, usersService: UsersService);
    getById(id: string): Promise<UserViewDto>;
    getAll(query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>>;
    createUser(body: CreateUserInputDto): Promise<UserViewDto>;
    updateUser(id: string, body: UpdateUserInputDto): Promise<UserViewDto>;
    deleteUser(id: string): Promise<void>;
}
