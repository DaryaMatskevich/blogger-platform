import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { TestingService } from './testing.service';
import { User } from './../user-accounts/domain/dto/user.entity';
import { Session } from './../../modules/user-accounts/sessions/domain/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
