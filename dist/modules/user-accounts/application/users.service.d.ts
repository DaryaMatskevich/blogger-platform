import { CreateUserDto } from '../dto/create-user.dto';
import { UserModelType } from '../domain/dto/user.entity';
import { UsersRepository } from '../infastructure/users.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
import { EmailService } from '@src/modules/notifications/email.service';
import { CryptoService } from './crypto.service';
export declare class UsersService {
    private UserModel;
    private usersRepository;
    private emailService;
    private cryptoService;
    constructor(UserModel: UserModelType, usersRepository: UsersRepository, emailService: EmailService, cryptoService: CryptoService);
    createUser(dto: CreateUserDto): Promise<string>;
    updateUser(id: string, dto: UpdateUserDto): Promise<string>;
    deleteUser(id: string): Promise<void>;
    registerUser(dto: CreateUserDto): Promise<void>;
}
