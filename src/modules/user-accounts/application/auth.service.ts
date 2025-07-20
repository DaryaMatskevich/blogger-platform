import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { UsersRepository } from '../infastructure/users.repository';
import { UserContextDto } from '../guards/dto/user-contex.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../../modules/notifications/email.service';
import { DomainException } from '../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../core/exeptions/domain-exeption-codes';


@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private emailService: EmailService
  ) { }

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    console.log("FUF")
    if (!user) {
     throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "Bad request"
        })
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
               throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: "User with the same login already exists"
        })
    }

    return { id: user._id.toString() };
  }

  async login(userId: string) {
    const accessToken = this.jwtService.sign({ id: userId } as UserContextDto);

    return {
      accessToken,
    };
  }

  async confirmEmail(code: string): Promise<string | null> {
    let user = await this.usersRepository.findUserByConfirmationCode(code)

    if (!user) {

      throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "User with the same login already exists"
        })
    }
    if (user.confirmationCodeExpiresAt! < new Date()) {
      throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "User with the same login already exists"
        })
    };

    if (user.isEmailConfirmed) {
      throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "User with the same login already exists"
        })
    }

    user.confirmEmail()
    await this.usersRepository.save(user);

    return user._id.toString();
  }


  async resendConfirmationEmail(email: string): Promise<boolean | any> {
    let user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: "User with the same login already exists"
        })
    }

    if (user.isEmailConfirmed) {
      throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "User with the same login already exists"
        })
    }
    const confirmCode = uuidv4();
    user.setConfirmationCode(confirmCode)
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);




  }

  async sendPasswordRecoveryEmail(email: string): Promise<boolean | any> {

    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "User with the same login already exists"
        })
    }

    const recoveryCode = uuidv4();
    user.setRecoveryCode(recoveryCode)
     await this.usersRepository.save(user);
   
        this.emailService
      .sendPasswordRecoveryEmail(user.email, recoveryCode)
      .catch(console.error);
  }

  async setNewPassword(newPassword: string, recoveryCode: string): Promise<boolean | any> {
    const user = await this.usersRepository.findUserByRecoveryCode(recoveryCode)
    if (!user) {
      throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "User with the same login already exists"
        })
    }

    const isSamePassword = await this.cryptoService.checkPassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "User with the same login already exists"
        })
    }
    if(user.recoveryCodeExpiresAt && user.recoveryCodeExpiresAt < new Date()) {
throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "User with the same login already exists"
        })
    }
    const newPasswordHash = await this.cryptoService.createPasswordHash(newPassword)
    
   user.setNewPasswordHash(newPasswordHash)
await this.usersRepository.save(user);

    return user._id.toString();
    }
  }
