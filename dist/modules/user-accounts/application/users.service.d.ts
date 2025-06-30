import { CreateUserDto } from '../dto/create-user.dto';
import { UserModelType } from '../domain/dto/user.entity';
import { UsersRepository } from '../infastructure/users.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
export declare class UsersService {
    private UserModel;
    private usersRepository;
    constructor(UserModel: UserModelType, usersRepository: UsersRepository);
    createUser(dto: CreateUserDto): Promise<string>;
    updateUser(id: string, dto: UpdateUserDto): Promise<string>;
    deleteUser(id: string): Promise<void>;
}
