import { Module } from '@nestjs/common';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infastructure/blogs.repository';
import { Blog } from './blogs/domain/dto/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsQueryRepository } from './blogs/infastructure/query/blogs.query-repository';
import { BlogsExternalQueryRepository } from './blogs/infastructure/external-query/external-dto/blogs.external-query-repository';
import { Post } from './posts/domain/post.entity';
import { PostsController } from './posts/api/posts.controller';
import { PostsService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infactructure/posts.repository';
import { PostsQueryRepository } from './posts/infactructure/query/posts.query-repository';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog-usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog-usecase'; //import { CreatePostUseCase } from './posts/application/usecases/create-post-usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post-usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post-usecase';
import { CreatePostForBlogUseCase } from './posts/application/usecases/create-post-for-blog-usecase';
import { CqrsModule } from '@nestjs/cqrs'; // import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment-usecase';
// import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query-handler';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query-handler';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query-handler';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query-handler'; //import { CreateCommentForPostUseCase } from './comments/application/usecases/create-comment-for-post.usecase';
import { UserAccountsModule } from '../user-accounts/userAccounts.module'; //import { LikePost } from './posts/domain/likes/like.entity';
//import { putLikeStatusForPostUseCase } from './posts/application/usecases/put-likeStatus.usecase';
//import { PutLikeStatusForCommentUseCase } from './comments/application/usecases/put-likeStatus.usecase';
//import { LikeComment } from './comments/domain/likes/like.entity';
//import { GetCommenttByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query-handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaBlogsController } from '../bloggers-platform/blogs/api/sa.blogs.controller';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  //CreatePostUseCase,
  UpdatePostUseCase,
  //putLikeStatusForPostUseCase,
  DeletePostUseCase,
  CreatePostForBlogUseCase,
  // PutLikeStatusForCommentUseCase,
  // GetCommenttByIdQueryHandler,
  // DeleteCommentUseCase,
  // UpdateCommentUseCase,
  // CreateCommentForPostUseCase,
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
  GetPostByIdQueryHandler,
  GetPostsQueryHandler,
];
//тут регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Укажите ваши entities здесь
      Blog,
      Post,
      // PostLike,
      //Comment,
      //LikeComment,
    ]),
    UserAccountsModule,
    CqrsModule,
  ],
  controllers: [
    BlogsController,
    SaBlogsController,
    PostsController,
    // CommentsController,
  ],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogsExternalQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    // CommentsRepository,
    // CommentsQueryRepository,
    // LikesPostQueryRepository,
    // LikesPostRepository,
    // LikesCommentRepository,
    // LikesCommentQueryRepository,
    ...useCases,
  ],
  exports: [BlogsExternalQueryRepository],
})
export class BloggersPlatformModule {}
