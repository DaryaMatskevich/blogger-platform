// src/testing/testing.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

// Импортируйте другие сущности

@Injectable()
export class TestingService {
  constructor(private readonly dataSource: DataSource) {}

  async deleteAllData(): Promise<void> {
    try {
      // Очистка в правильном порядке (сначала дочерние таблицы, потом родительские)
      await this.dataSource.query(`
      TRUNCATE TABLE 
        "users", 
        "sessions", 
        "blogs", 
        "posts", 
        "comments", 
        "commentLikes", 
        "postLikes", 
        "questions"
      RESTART IDENTITY CASCADE
    `);
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }
}
