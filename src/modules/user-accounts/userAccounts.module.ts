import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';







import { User, UserSchema } from './domain/dto/user.entity';
import { UsersRepository } from './infastructure/users.repository';
import { UsersQueryRepository } from './infastructure/query/users.query-repository';
import { UsersExternalQueryRepository } from './infastructure/external-query/external-dto/users.external-query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,


    UsersExternalQueryRepository,

  ],
  exports: [UsersExternalQueryRepository],
})
export class UserAccountsModule { }
