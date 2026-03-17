import { Module } from '@nestjs/common';
import { SaUsersController } from '../../modules/sa/sa.users/api/sa.users-controller';
import { UserAccountsModule } from '../user-accounts/userAccounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { SaUsersService } from './sa.users/application/sa.users-service';
import { AdminBasicAuthGuard } from './guards/basic/admin-auth.guard';
import { DeleteUserUseCase } from '../../modules/sa/sa.users/application/sa-usecases/delete-user-usecase';
import { AdminConfig } from '../../modules/sa/admin.config';
import SaBlogsController from '../../modules/sa/sa.blogs/api/sa.blogs.controller';
import { CreateBlogUseCase } from '../../modules/sa/sa.blogs/application/usecases/create-blog-usecase';
import { UpdateBlogUseCase } from '../../modules/sa/sa.blogs/application/usecases/update-blog.usecase';
import { BlogsQueryRepository } from '../../modules/bloggers-platform/blogs/infastructure/query/blogs.query-repository';
import { PostsQueryRepository } from '../../modules/bloggers-platform/posts/infactructure/query/posts.query-repository';
import { GetBlogsQueryHandler } from '../../modules/bloggers-platform/blogs/application/queries/get-blogs.query-handler';
import { GetPostsForBlogQueryHandler } from '../../modules/bloggers-platform/posts/application/queries/get-posts-for-blog.query-handler';
import { BlogsRepository } from '../../modules/bloggers-platform/blogs/infastructure/blogs.repository';

@Module({
  imports: [CqrsModule, UserAccountsModule],
  controllers: [SaUsersController, SaBlogsController],
  providers: [
    AdminBasicAuthGuard,
    SaUsersService,
    DeleteUserUseCase,
    CreateBlogUseCase,
    DeleteUserUseCase,
    UpdateBlogUseCase,
    AdminConfig,
    BlogsQueryRepository,
    PostsQueryRepository,
    BlogsRepository,
    GetBlogsQueryHandler,
    GetPostsForBlogQueryHandler,
  ],
  exports: [AdminConfig],
})
export class SaModule {}
