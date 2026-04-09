import { configModule } from './dynamic-config-module';
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/user-accounts/userAccounts.module';
import { CoreModule } from './core/core.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exeptions/filters/all-exeptions.filter';
import { DomainHttpExceptionsFilter } from './core/exeptions/filters/domain-exeptions.fiter';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './modules/user-accounts/sessions/domain/session.entity';
import { User } from './modules/user-accounts/users/domain/user.entity';
import { TestingModule } from './modules/testing/testing.module';
import { SaModule } from './modules/sa/sa.module';
import { Blog } from './modules/bloggers-platform/blogs/domain/blog.entity';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { CommentLike } from './modules/bloggers-platform/comments/domain/comment-like.entity';
import { Comment } from './modules/bloggers-platform/comments/domain/comment.entity';
import { PostLike } from './modules/bloggers-platform/posts/domain/likes/post-like.entity';
import { Confirmation } from './modules/user-accounts/users/domain/confirmation.entity';
import { Post } from './modules/bloggers-platform/posts/domain/post.entity';
import { CoreConfig } from './core/core.config';
import { GameQuizModule } from './modules/pairGameQuiz/game.quiz.module';

@Module({
  imports: [
    CoreModule,
    configModule,
    CqrsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : 'api/swagger',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      entities: [
        Session,
        User,
        Blog,
        Post,
        Confirmation,
        Comment,
        CommentLike,
        PostLike,
      ],
      url: 'postgresql://neondb_owner:npg_R2NHxQU0gtif@ep-lively-thunder-ahb1wqlr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserAccountsModule, //все модули должны быть заимпортированы в корневой модуль, либо напрямую, либо по цепочке (через другие модули)
    TestingModule,
    SaModule,
    BloggersPlatformModule,
    CoreModule,
    NotificationsModule,
    GameQuizModule,
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
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS
    const modules: any[] = [];

    if (coreConfig.includeTestingModule) {
      modules.push(TestingModule);
    }

    return {
      module: AppModule,
      imports: modules, // Add dynamic modules here
    };
  }
}
