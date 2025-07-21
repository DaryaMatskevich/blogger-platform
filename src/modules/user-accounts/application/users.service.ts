import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { User, UserModelType } from '../domain/dto/user.entity';
import { UsersRepository } from '../infastructure/users.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
import { EmailService } from '../../../modules/notifications/email.service';
import { CryptoService } from './crypto.service';
import { v4 as uuidv4 } from 'uuid';
import { DomainException, Extension } from '../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../core/exeptions/domain-exeption-codes';


@Injectable()
export class UsersService {
  constructor(
    //инжектирование модели в сервис через DI
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private cryptoService: CryptoService,
  ) { }

  async createUser(dto: CreateUserDto): Promise<string> {
    const userWithTheSameLogin = await this.usersRepository.findByLogin(
      dto.login
    )
    if (!!userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with the same login already exists",
        extensions: [
          new Extension("User with the same login already exists", "login")
        ]
      })

    }

       const userWithTheSameEmail = await this.usersRepository.findByLogin(
      dto.email
    )
    if (!!userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with the same email already exists",
        extensions: [
          new Extension("User with the same email already exists", "email")
        ]
      })

    }


    
    const passwordHash = await this.cryptoService.createPasswordHash(dto.password);

    const user = this.UserModel.createInstance({
      login: dto.login,
      passwordHash: passwordHash,
      email: dto.email,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }
  async updateUser(id: string, dto: UpdateUserDto): Promise<string> {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
    // создаём метод
    user.update(dto); // change detection

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }

  async registerUser(dto: CreateUserDto) {
    const userWithTheSameLogin = await this.usersRepository.findByLogin(
      dto.login
    )
    if (userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with the same login already exists",
        extensions: [
          new Extension("User with the same login already exists", "login")
        ]
      })
    }
    const userWithTheSameEmail = await this.usersRepository.findByEmail(
      dto.email
    )
    if (userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with the same email already exists",
        extensions: [
          new Extension("User with the same email already exists", "email")
        ]
      })
    }

    const createdUserId = await this.createUser(dto);

    const confirmCode = uuidv4();

    const user = await this.usersRepository.findOrNotFoundFail(
      createdUserId
    );

    user.setConfirmationCode(confirmCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);
  }
}
