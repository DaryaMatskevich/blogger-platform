// src/testing/testing.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user-accounts/domain/dto/user.entity';
import { Session } from '../user-accounts/sessions/domain/session.entity';

// Импортируйте другие сущности

@Injectable()
export class TestingService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
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
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }
}
