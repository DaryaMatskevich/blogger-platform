import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/dto/user.entity';
import { UsersRepository } from './infastructure/users.repository';
import { UsersQueryRepository } from './infastructure/query/users.query-repository';
import { UsersExternalQueryRepository } from './infastructure/external-query/external-dto/users.external-query-repository';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { CryptoService } from './application/crypto.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthService } from './application/auth.service';
import { AuthQueryRepository } from './infastructure/query/auth.query-repository';
import { SecurityDevicesQueryRepository } from './infastructure/query/security-devices.query-repository';
import { EmailService } from '../notifications/email.service';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
      JwtModule.register({
      secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
      signOptions: { expiresIn: '5m' }, // Время жизни токена
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule
  ],
  controllers: [UsersController],
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
    EmailService,
    JwtStrategy,
    UsersExternalQueryRepository,
   
  ],
  exports: [UsersExternalQueryRepository],
})
export class UserAccountsModule { }
