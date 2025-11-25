// src/testing/testing.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user-accounts/domain/dto/user.entity';
import { Session } from '../user-accounts/sessions/domain/session.entity';
import { Blog } from '../../../src/modules/bloggers-platform/blogs/domain/dto/blog.entity';

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
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }
}
