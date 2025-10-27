import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/services/users.service';
import { UsersQueryRepository } from './infastructure/query/users.query-repository';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { CryptoService } from './application/services/crypto.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthService } from './application/services/auth.service';
import { AuthQueryRepository } from './infastructure/query/auth.query-repository';
import { SecurityDevicesQueryRepository } from './infastructure/query/security-devices.query-repository';
import { JwtService } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './api/auth.controller';
import { UsersExternalService } from './application/external/users.external-service';
import { UsersRepository } from './infastructure/users.repository';
import { UsersExternalQueryRepository } from './infastructure/external-query/external-dto/users.external-query-repository';
import { ValidateUserUseCase } from './application/auth-usecases/validate-user-usecase';
import { ConfirmEmailUseCase } from './application/auth-usecases/confirm-email-usecase';
import { LoginUseCase } from './application/auth-usecases/login-usecase';
import { ResendConfirmationEmailUseCase } from './application/auth-usecases/resend-confirmation-email-usecase';
import { SendPasswordRecoveryEmailUseCase } from './application/auth-usecases/send-password-recovery-email-usecase';
import { SetNewPasswordUseCase } from './application/auth-usecases/set-new-password-usecase';
import { RegisterUserUseCase } from './application/users-usecases/register-user-usecase';
import { UpdateUserUseCase } from './application/users-usecases/update-user-usecase';
import { DeleteUserUseCase } from './application/users-usecases/delete-user-usecase';
import { CqrsModule } from '@nestjs/cqrs';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { CreateSessionUseCase } from './sessions/application/usecases/create-session.usecase';
import { SessionsQueryRepository } from './sessions/infrastructure/query/sessions.query-repository';
import { SessionsController } from './sessions/api/sessions-controller';

import { DeleteSessionUseCase } from './sessions/application/usecases/delete-session.use-case';
import { DeleteAllSessionsExcludeCurrentUseCase } from './sessions/application/usecases/delete-all-sessions-exclude-current.use.case';
import { RefreshTokenStrategy } from './guards/bearer/refresh-token.strategy';
import { LogOutUseCase } from './application/auth-usecases/logout.usecase';
import { RefreshTokensUseCase } from './application/auth-usecases/refresh-tokens.usecase';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../modules/user-accounts/domain/dto/user.entity';
import { Session } from '../../modules/user-accounts/sessions/domain/session.entity';
import { SessionRepository } from '../../modules/user-accounts/sessions/infrastructure/sessions.repository';

const useCases = [
  RegisterUserUseCase,
  ValidateUserUseCase,
  ConfirmEmailUseCase,
  LoginUseCase,
  ResendConfirmationEmailUseCase,
  SendPasswordRecoveryEmailUseCase,
  SetNewPasswordUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  CreateSessionUseCase,
  RefreshTokensUseCase,
  LogOutUseCase,
  DeleteSessionUseCase,
  DeleteAllSessionsExcludeCurrentUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Укажите ваши entities здесь
      User,
      Session,
    ]),
    ThrottlerModule.forRoot([
      {
        name: 'default', // Имя конфигурации
        ttl: 10000, // 10 секунд
        limit: 5,
      },
    ]),

    CqrsModule,
    // MongooseModule.forFeature([
    //   { name: User.name, schema: UserSchema },
    //   { name: Session.name, schema: SessionSchema },
    // ]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController, SessionsController],
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
    RefreshTokenStrategy,
    UsersExternalQueryRepository,
    UsersExternalService,
    SessionsQueryRepository,
    SessionRepository,
    ...useCases,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
          signOptions: { expiresIn: '10m' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: 'refresh-token-secret', //TODO: move to env. will be in the following lessons
          signOptions: { expiresIn: '20m' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
  ],
  exports: [JwtStrategy, UsersExternalQueryRepository, UsersExternalService],
})
export class UserAccountsModule {}
