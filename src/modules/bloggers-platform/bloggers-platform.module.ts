import { Module } from '@nestjs/common';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infastructure/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/dto/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsQueryRepository } from './blogs/infastructure/query/blogs.query-repository';
import { BlogsExternalQueryRepository } from './blogs/infastructure/external-query/external-dto/blogs.external-query-repository';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsController } from './posts/api/posts.controller';
import { PostsService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infactructure/posts.repository';
import { PostsQueryRepository } from './posts/infactructure/query/posts.query-repository';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog-usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog-usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post-usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post-usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post-usecase';
import { CreatePostForBlogUseCase } from './posts/application/usecases/create-post-for-blog-usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { ChangeLikeStatusUseCase } from './comments/application/usecases/change-likeStatus.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment-usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsRepository } from './comments/infrastructute/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructute/query/comments.query-repository';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blogs-by-id.query-handler';
import {GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query-handler';
import { GetPostByIdQuery, GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query-handler';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query-handler';
import { CreateCommentForPostUseCase } from './comments/application/usecases/create-comment-for-post.usecase';
import { UserAccountsModule } from '../user-accounts/userAccounts.module';
import { ChangeLikeStatusForPostUseCase } from './posts/application/usecases/change-likeStatus.usecase';


const useCases = [CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogUseCase, 
  CreatePostUseCase, UpdatePostUseCase, ChangeLikeStatusForPostUseCase, DeletePostUseCase, CreatePostForBlogUseCase,
ChangeLikeStatusUseCase, DeleteCommentUseCase, UpdateCommentUseCase, CreateCommentForPostUseCase, GetBlogByIdQueryHandler, GetBlogsQueryHandler, GetPostByIdQueryHandler, GetPostsQueryHandler ]
//тут регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [
    UserAccountsModule,
    CqrsModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogsExternalQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    ...useCases
  ],
  exports: [BlogsExternalQueryRepository],
})
export class BloggersPlatformModule { }
