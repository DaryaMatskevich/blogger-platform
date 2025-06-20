import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from 'src/modules/user-accounts/userAccounts.module';
import { CoreModule } from 'src/core/core.module';
import { TestingModule } from 'src/modules/testing/testing.module';
import { BloggersPlatformModule } from 'src/modules/bloggers-platform/bloggers-platform.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ?   '/' : '/Blogger Swagger' // Путь к папке со статикой
    }),
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017', {
      dbName: 'nest-bloggers-platform'
    }),//ODO: move to env. will be in the following lessons

    UserAccountsModule, //все модули должны быть заимпортированы в корневой модуль, либо напрямую, либо по цепочке (через другие модули)
    TestingModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


//mongod.exe --dbpath .\data\db ctrl break остановить WIN R cmd