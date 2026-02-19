// src/testing/testing.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user-accounts/domain/dto/user.entity';
import { Session } from '../user-accounts/sessions/domain/session.entity';
import { Blog } from '../bloggers-platform/blogs/domain/blog.entity';
import { Post } from '../../modules/bloggers-platform/posts/domain/post.entity';
import { Comment } from '../../modules/bloggers-platform/comments/domain/comment.entity';
import { CommentLike } from '../../modules/bloggers-platform/comments/domain/comment-like.entity';
import { PostLike } from '../../modules/bloggers-platform/posts/domain/likes/post-like.entity';

// Импортируйте другие сущности

@Injectable()
export class TestingService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikesRepository: Repository<CommentLike>,
    @InjectRepository(PostLike)
    private readonly postLikesRepository: Repository<PostLike>,
    // Добавьте другие репозитории
  ) {}

  async deleteAllData(): Promise<void> {
    try {
      // Очистка в правильном порядке (сначала дочерние таблицы, потом родительские)
      await this.sessionsRepository.query(
        'TRUNCATE TABLE sessions RESTART IDENTITY CASCADE',
      );
      await this.usersRepository.query(
        'TRUNCATE TABLE users RESTART IDENTITY CASCADE',
      );
      await this.blogsRepository.query(
        'TRUNCATE TABLE blogs RESTART IDENTITY CASCADE',
      );
      await this.postsRepository.query(
        'TRUNCATE TABLE posts RESTART IDENTITY CASCADE',
      );
      await this.commentsRepository.query(
        'TRUNCATE TABLE comments RESTART IDENTITY CASCADE',
      );
      await this.commentLikesRepository.query(
        'TRUNCATE TABLE "commentLikes" RESTART IDENTITY CASCADE',
      );
      await this.postLikesRepository.query(
        'TRUNCATE TABLE "postLikes" RESTART IDENTITY CASCADE',
      );
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }
}
