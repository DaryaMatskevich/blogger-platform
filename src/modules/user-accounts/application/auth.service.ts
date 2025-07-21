import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { UsersRepository } from '../infastructure/users.repository';
import { UserContextDto } from '../guards/dto/user-contex.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../../modules/notifications/email.service';
import { DomainException, Extension } from '../../../core/exeptions/domain-exeptions';
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

    if (!user) {
      return null
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null
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
        message: "User not found",
         
        
      })
    }
    if (user.confirmationCodeExpiresAt! < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Bad request",
       
      })
    };

    if (user.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Bad requet",
       
      })
    }

    if(user.confirmationCode !== code)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Bad requet",
       extensions: [
          new Extension("Code is wrong", "code")
        ]
      })
    user.confirmEmail()
    await this.usersRepository.save(user);

    return user._id.toString();
  }


  async resendConfirmationEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with this email not found",
        extensions: [
          new Extension("Email is wrong", "email")
        ]
      })
    }

    if (user.isEmailConfirmed === true) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User is already confirmed",
        
      })
    }
    const confirmCode = uuidv4();
    user.setConfirmationCode(confirmCode)
    await this.usersRepository.save(user);
console.log("хохохо")
    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);




  }

  async sendPasswordRecoveryEmail(email: string) {

    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with this email not found",
        extensions: [
          new Extension("Email is wrong", "email")
        ]
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
        message: "User not found",
       
      })
    }

    const isSamePassword = await this.cryptoService.checkPassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Password is invalid",
        extensions: [
          new Extension("Password is invalid", "password")
        ]
      })
    }
    if (user.recoveryCodeExpiresAt && user.recoveryCodeExpiresAt < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Bad request",
       
      })
    }
    const newPasswordHash = await this.cryptoService.createPasswordHash(newPassword)

    user.setNewPasswordHash(newPasswordHash)
    await this.usersRepository.save(user);

    return user._id.toString();
  }
}
