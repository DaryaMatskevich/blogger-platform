import { Module } from '@nestjs/common';
import { SaUsersController } from './api/sa.users-controller';
import { UserAccountsModule } from '../user-accounts/userAccounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { SaUsersService } from './application/sa.users-service';
import { AdminBasicAuthGuard } from './guards/basic/admin-auth.guard';

@Module({
  imports: [CqrsModule, UserAccountsModule],
  controllers: [SaUsersController],
  providers: [AdminBasicAuthGuard, SaUsersService],
})
export class SaModule {}
