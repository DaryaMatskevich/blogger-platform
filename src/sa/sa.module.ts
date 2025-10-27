import { Module } from '@nestjs/common';
import { SaUsersController } from '../sa/sa.users-controller';
import { UserAccountsModule } from '../modules/user-accounts/userAccounts.module';

@Module({
  imports: [UserAccountsModule], // ← Импортируем модуль, где находится UsersService
  controllers: [SaUsersController],
})
export class SaModule {}
