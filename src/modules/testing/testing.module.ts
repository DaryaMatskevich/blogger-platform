import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { TestingService } from './testing.service';
import { User } from './../user-accounts/domain/dto/user.entity';
import { Session } from './../../modules/user-accounts/sessions/domain/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from '../../modules/bloggers-platform/blogs/domain/dto/blog.entity';
import { Post } from '../../modules/bloggers-platform/posts/domain/post.entity';
import { Comment } from '../../modules/bloggers-platform/comments/domain/comment.entity';
import { CommentLike } from '../../modules/bloggers-platform/comments/domain/comment-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, Blog, Post, Comment, CommentLike]),
  ],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
