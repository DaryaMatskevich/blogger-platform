import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/userAccounts.module';
import { CoreModule } from './core/core.module';
import { TestingModule } from './modules/testing/testing.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exeptions/filters/all-exeptions.filter';
import { DomainHttpExceptionsFilter } from './core/exeptions/filters/domain-exeptions.fiter';
import { NotificationsModule } from './modules/notifications/notifications.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : 'api/swagger',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      dbName: 'nest-bloggers-platform'
    }),//ODO: move to env. will be in the following lessons

    UserAccountsModule, //все модули должны быть заимпортированы в корневой модуль, либо напрямую, либо по цепочке (через другие модули)
    TestingModule,
    BloggersPlatformModule,
    CoreModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    }],
})
export class AppModule {
  constructor() {
    Logger.log(`MongoDB URL: ${process.env.MONGO_URL}`, 'AppModule');
  }
}


