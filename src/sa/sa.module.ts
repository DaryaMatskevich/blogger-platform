import { Module } from '@nestjs/common';
import { SaUsersController } from '../sa/sa.users-controller';
import { UserAccountsModule } from '../modules/user-accounts/userAccounts.module';
import { SaGuard } from '../sa/sa.guard';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule, UserAccountsModule], // ← Импортируем модуль, где находится UsersService
  controllers: [SaUsersController],
  providers: [SaGuard],
})
export class SaModule {}
