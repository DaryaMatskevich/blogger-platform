import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from 'src/modules/user-accounts/userAccounts.module';
import { CoreModule } from 'src/core/core.module';
import { TestingModule } from 'src/modules/testing/testing.module';
import { BloggersPlatformModule } from 'src/modules/bloggers-platform/bloggers-platform.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest-bloggers-platform'),//ODO: move to env. will be in the following lessons
    UserAccountsModule, //все модули должны быть заимпортированы в корневой модуль, либо напрямую, либо по цепочке (через другие модули)
    TestingModule,
    BloggersPlatformModule,
   CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}