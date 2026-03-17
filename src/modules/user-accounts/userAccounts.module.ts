import { Module } from '@nestjs/common';
import { UsersService } from '../../modules/user-accounts/users/application/services/users.service';
import { UsersQueryRepository } from '../../modules/user-accounts/users/infastructure/query/users.query-repository';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { CryptoService } from '../../modules/user-accounts/users/application/services/crypto.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtService } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from '../../modules/user-accounts/users/api/auth.controller';
import { UsersRepository } from '../../modules/user-accounts/users/infastructure/users.repository';
import { UsersExternalQueryRepository } from '../../modules/user-accounts/users/infastructure/external-query/external-dto/users.external-query-repository';
import { ValidateUserUseCase } from '../../modules/user-accounts/users/application/auth-usecases/validate-user-usecase';
import { ConfirmEmailUseCase } from '../../modules/user-accounts/users/application/auth-usecases/confirm-email-usecase';
import { LoginUseCase } from '../../modules/user-accounts/users/application/auth-usecases/login-usecase';
import { ResendConfirmationEmailUseCase } from '../../modules/user-accounts/users/application/auth-usecases/resend-confirmation-email-usecase';
import { SendPasswordRecoveryEmailUseCase } from '../../modules/user-accounts/users/application/auth-usecases/send-password-recovery-email-usecase';
import { SetNewPasswordUseCase } from '../../modules/user-accounts/users/application/auth-usecases/set-new-password-usecase';
import { RegisterUserUseCase } from '../../modules/user-accounts/users/application/auth-usecases/register-user-usecase';
import { CqrsModule } from '@nestjs/cqrs';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../modules/user-accounts/users/constants/auth-tokens.inject-constants';
import { CreateSessionUseCase } from './sessions/application/usecases/create-session.usecase';
import { SessionsQueryRepository } from './sessions/infrastructure/query/sessions.query-repository';
import { SessionsController } from './sessions/api/sessions-controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { DeleteSessionUseCase } from './sessions/application/usecases/delete-session.use-case';
import { DeleteAllSessionsExcludeCurrentUseCase } from './sessions/application/usecases/delete-all-sessions-exclude-current.use.case';
import { RefreshTokenStrategy } from './guards/bearer/refresh-token.strategy';
import { LogOutUseCase } from '../../modules/user-accounts/users/application/auth-usecases/logout.usecase';
import { RefreshTokensUseCase } from '../../modules/user-accounts/users/application/auth-usecases/refresh-tokens.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../modules/user-accounts/users/domain/user.entity';
import { Session } from '../../modules/user-accounts/sessions/domain/session.entity';
import { SessionsRepository } from '../../modules/user-accounts/sessions/infrastructure/sessions.repository';
import { ConfirmationRepository } from '../../modules/user-accounts/users/infastructure/confirmation.repository';
import { UserAccountsConfig } from '../../modules/user-accounts/user-accounts.config';

const useCases = [
  RegisterUserUseCase,
  ValidateUserUseCase,
  ConfirmEmailUseCase,
  LoginUseCase,
  ResendConfirmationEmailUseCase,
  SendPasswordRecoveryEmailUseCase,
  SetNewPasswordUseCase,
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
    NotificationsModule,
  ],
  controllers: [AuthController, SessionsController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    UsersExternalQueryRepository,
    LocalStrategy,
    CryptoService,
    JwtStrategy,
    RefreshTokenStrategy,
    UsersExternalQueryRepository,
    SessionsQueryRepository,
    SessionsRepository,
    ConfirmationRepository,
    UserAccountsConfig,
    ...useCases,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountsConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountsConfig.accessTokenSecret,
          signOptions: {
            expiresIn: userAccountsConfig.accessTokenExpireInSeconds,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountsConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountsConfig.refreshTokenSecret,
          signOptions: {
            expiresIn: userAccountsConfig.refreshTokenExpireInSeconds,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
  ],
  exports: [
    JwtStrategy,
    UsersExternalQueryRepository,
    UsersQueryRepository,
    UsersService,
    CryptoService,
    UsersRepository,
    ConfirmationRepository,
  ],
})
export class UserAccountsModule {}
