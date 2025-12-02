import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesCommentQueryRepository {
  constructor(private dataSource: DataSource) {}
  async getLikesCount(
    commentId: number,
  ): Promise<{ likes: number; dislikes: number }> {
    const query = `
      SELECT 
        COUNT(CASE WHEN status = 'Like' THEN 1 END) as likes,
        COUNT(CASE WHEN status = 'Dislike' THEN 1 END) as dislikes
      FROM commentsLikes 
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
  ): Promise<'Like' | 'Dislike' | 'None'> {
    const query = `
      SELECT status FROM "commentsLikes" 
      WHERE "userId" = $1 AND "commentId" = $2
      LIMIT 1
    `;

    try {
      const result = await this.dataSource.query(query, [userId, commentId]);

      if (result.length === 0) {
        return 'None';
      }

      return result[0].status;
    } catch (error) {
      // В случае ошибки (например, если таблица не существует) возвращаем None
      console.error('Error getting user status:', error);
      return 'None';
    }
  }
}
