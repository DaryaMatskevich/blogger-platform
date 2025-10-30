import { Module } from '@nestjs/common';
import { SaUsersController } from '../sa/sa.users-controller';
import { UserAccountsModule } from '../modules/user-accounts/userAccounts.module';
import { SaGuard } from '../sa/sa.guard';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteUserUseCase } from '../modules/user-accounts/application/users-usecases/delete-user-usecase';

@Module({
  imports: [CqrsModule, UserAccountsModule], // ← Импортируем модуль, где находится UsersService
  controllers: [SaUsersController],
  providers: [SaGuard, DeleteUserUseCase],
})
export class SaModule {}
