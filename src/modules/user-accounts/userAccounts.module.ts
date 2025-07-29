import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/dto/user.entity';
import { UsersQueryRepository } from './infastructure/query/users.query-repository';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { CryptoService } from './application/crypto.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthService } from './application/auth.service';
import { AuthQueryRepository } from './infastructure/query/auth.query-repository';
import { SecurityDevicesQueryRepository } from './infastructure/query/security-devices.query-repository';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './api/auth.controller';
import { UsersExternalService } from './application/users.external-service';
import { UsersRepository } from './infastructure/users.repository';
import { UsersExternalQueryRepository } from './infastructure/external-query/external-dto/users.external-query-repository';
import { ValidateUserUseCase } from './application/auth-usecases/validate-user-usecase';
import {  ConfirmEmailUseCase } from './application/auth-usecases/confirm-email-usecase';
import { LoginUseCase } from './application/auth-usecases/login-usecase';
import {  ResendConfirmationEmailUseCase } from './application/auth-usecases/resend-confirmation-email-usecase';
import {  SendPasswordRecoveryEmailUseCase } from './application/auth-usecases/send-password-recovery-email-usecase';
import {  SetNewPasswordUseCase } from './application/auth-usecases/set-new-password-usecase';
import { RegisterUserUseCase } from './application/users-usecases/register-user-usecase';
import { UpdateUserUseCase } from './application/users-usecases/update-user-usecase';
import { DeleteUserUseCase } from './application/users-usecases/delete-user-usecase';
import { CqrsModule } from '@nestjs/cqrs';


const useCases = [RegisterUserUseCase, ValidateUserUseCase, 
  ConfirmEmailUseCase, LoginUseCase, 
  ResendConfirmationEmailUseCase, SendPasswordRecoveryEmailUseCase, 
  SetNewPasswordUseCase, UpdateUserUseCase, 
  DeleteUserUseCase]


@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
      signOptions: { expiresIn: '5m' }, // Время жизни токена
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    UsersExternalQueryRepository,
    SecurityDevicesQueryRepository,
    AuthQueryRepository,
    AuthService,
    LocalStrategy,
    CryptoService,
    JwtStrategy,
    UsersExternalQueryRepository,
    UsersExternalService,
    ...useCases

  ],
  exports: [JwtStrategy,UsersExternalQueryRepository, UsersExternalService],
})
export class UserAccountsModule { }
