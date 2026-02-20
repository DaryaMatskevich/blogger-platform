import { Module } from '@nestjs/common';
import { BlogsRepository } from './blogs/infastructure/blogs.repository';
import { Blog } from './blogs/domain/blog.entity';
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
import { UpdatePostUseCase } from './posts/application/usecases/update-post-usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post-usecase';
import { CreatePostForBlogUseCase } from './posts/application/usecases/create-post-for-blog-usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query-handler';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query-handler';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query-handler';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query-handler';
import { CreateCommentForPostUseCase } from './comments/application/usecases/create-comment-for-post.usecase';
import { UserAccountsModule } from '../user-accounts/userAccounts.module'; //import { LikePost } from './posts/domain/likes/like.entity';
import { putLikeStatusForPostUseCase } from './posts/application/usecases/put-likeStatus.usecase';
import { PutLikeStatusForCommentUseCase } from './comments/application/usecases/put-likeStatus.usecase';
import { GetCommenttByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query-handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaBlogsController } from '../bloggers-platform/blogs/api/sa.blogs.controller';
import { CommentsRepository } from './comments/infrastructute/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructute/query/comments.query-repository';
import { CommentsController } from './comments/api/comments.controller';
import { DeleteCommentUseCase } from '../bloggers-platform/comments/application/usecases/delete-comment-usecase';
import { Comment } from '../bloggers-platform/comments/domain/comment.entity';
import { CommentLike } from '../bloggers-platform/comments/domain/comment-like.entity';
import { PostLike } from '../bloggers-platform/posts/domain/likes/post-like.entity';
import { PostLikesQueryRepository } from '../bloggers-platform/posts/infactructure/likes/postLikesQueryRepository';
import { PostLikesRepository } from '../bloggers-platform/posts/infactructure/likes/postLikesRepository';
import { CommentLikesRepository } from '../bloggers-platform/comments/infrastructute/likes/commentLikesRepository';
import { CommentLikesQueryRepository } from '../bloggers-platform/comments/infrastructute/likes/commentLikesQueryRepository';
import { DeleteBlogUseCase } from '../bloggers-platform/blogs/application/usecases/delete-blog-usecase';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  UpdatePostUseCase,
  putLikeStatusForPostUseCase,
  DeletePostUseCase,
  CreatePostForBlogUseCase,
  PutLikeStatusForCommentUseCase,
  GetCommenttByIdQueryHandler,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  CreateCommentForPostUseCase,
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
  GetPostByIdQueryHandler,
  GetPostsQueryHandler,
];
//тут регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Post, PostLike, Comment, CommentLike]),
    UserAccountsModule,
    CqrsModule,
  ],
  controllers: [
    BlogsController,
    SaBlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    BlogsRepository,
    BlogsQueryRepository,
    BlogsExternalQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    PostLikesQueryRepository,
    PostLikesRepository,
    CommentLikesRepository,
    CommentLikesQueryRepository,
    ...useCases,
  ],
  exports: [BlogsExternalQueryRepository],
})
export class BloggersPlatformModule {}
