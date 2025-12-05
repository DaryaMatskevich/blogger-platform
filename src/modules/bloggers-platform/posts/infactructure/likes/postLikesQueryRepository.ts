import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PostLikesQueryRepository {
  constructor(private dataSource: DataSource) {}
  async getLikesCount(
    postId: number,
  ): Promise<{ likes: number; dislikes: number }> {
    const query = `
      SELECT 
        COUNT(CASE WHEN status = 'Like' THEN 1 END) as likes,
        COUNT(CASE WHEN status = 'Dislike' THEN 1 END) as dislikes
      FROM "postLikes"
      WHERE "postId" = $1 AND status != 'None'
    `;

    const result = await this.dataSource.query(query, [postId]);
    return {
      likes: parseInt(result[0].likes) || 0,
      dislikes: parseInt(result[0].dislikes) || 0,
    };
  }
  async getCurrentUserStatus(
    userId: number,
    postId: number,
  ): Promise<'Like' | 'Dislike' | 'None' | null> {
    const query = `
      SELECT status FROM "postLikes" 
      WHERE "userId" = $1 AND "postId" = $2
      LIMIT 1
    `;

    try {
      const result = await this.dataSource.query(query, [userId, postId]);

      if (result.length === 0) {
        return null;
      }

      return result[0].status;
    } catch (error) {
      // В случае ошибки (например, если таблица не существует) возвращаем None
      console.error('Error getting user status:', error);
      return null;
    }
  }
}
