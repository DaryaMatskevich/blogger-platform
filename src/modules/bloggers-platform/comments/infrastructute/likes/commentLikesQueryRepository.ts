import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentLikesQueryRepository {
  constructor(private dataSource: DataSource) {}
  async getLikesCount(
    commentId: number,
  ): Promise<{ likes: number; dislikes: number }> {
    const query = `
      SELECT 
        COUNT(CASE WHEN status = 'Like' THEN 1 END) as likes,
        COUNT(CASE WHEN status = 'Dislike' THEN 1 END) as dislikes
      FROM "commentLikes" 
      WHERE "commentId" = $1 AND status != 'None'
    `;

    const result = await this.dataSource.query(query, [commentId]);
    return {
      likes: parseInt(result[0].likes) || 0,
      dislikes: parseInt(result[0].dislikes) || 0,
    };
  }
  async getCurrentUserStatus(
    userId: number,
    commentId: number,
  ): Promise<'Like' | 'Dislike' | 'None' | null> {
    const query = `
      SELECT status FROM "commentLikes" 
      WHERE "userId" = $1 AND "commentId" = $2
      LIMIT 1
    `;

    const result = await this.dataSource.query(query, [userId, commentId]);

    // Проверяем, есть ли записи
    if (result.length === 0) {
      return null;
    }

    // Получаем статус из первой записи
    const status = result[0].status;

    // Проверяем допустимые значения
    if (status === 'Like') {
      return 'Like';
    }
    if (status === 'Dislike') {
      return 'Dislike';
    }
    if (status === 'None') {
      return 'None';
    }
    return null;
  }
}
