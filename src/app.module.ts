// import { configModule } from './dynamic-config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/user-accounts/userAccounts.module';
import { CoreModule } from './core/core.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exeptions/filters/all-exeptions.filter';
import { DomainHttpExceptionsFilter } from './core/exeptions/filters/domain-exeptions.fiter';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './modules/user-accounts/sessions/domain/session.entity';
import { User } from './modules/user-accounts/domain/dto/user.entity';
import { TestingModule } from './modules/testing/testing.module';
import { SaModule } from './sa/sa.module';
import { Blog } from './modules/bloggers-platform/blogs/domain/dto/blog.entity';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { CommentLike } from './modules/bloggers-platform/comments/domain/comment-like.entity';
import { Comment } from './modules/bloggers-platform/comments/domain/comment.entity';

@Module({
  imports: [
    //configModule,
    CqrsModule,
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : 'api/swagger',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // или 'mysql', 'sqlite' и т.д.
      //host: 'localhost',
      //port: 5432,
      //username: 'nodejs',
      //password: 'nodejs',
      //database: 'BlogPlatform',
      entities: [Session, User, Blog, Comment, CommentLike],
      url: 'postgresql://neondb_owner:npg_R2NHxQU0gtif@ep-lively-thunder-ahb1wqlr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      autoLoadEntities: false,
      synchronize: false, // только для разработки!
    }),
    // MongooseModule.forRoot(process.env.MONGO_URL, {
    //   dbName: 'nest-bloggers-platform',
    // }), //ODO: move to env. will be in the following lessons

    UserAccountsModule, //все модули должны быть заимпортированы в корневой модуль, либо напрямую, либо по цепочке (через другие модули)
    TestingModule,
    SaModule,
    BloggersPlatformModule,
    CoreModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {
  constructor() {
    // Logger.log(`MongoDB URL: ${process.env.MONGO_URL}`, 'AppModule');
  }
}
