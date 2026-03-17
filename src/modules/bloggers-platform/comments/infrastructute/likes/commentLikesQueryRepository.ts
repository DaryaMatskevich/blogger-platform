import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../../../modules/bloggers-platform/common/enums/like-status.enum';

@Injectable()
export class CommentLikesQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getCurrentUserStatus(
    userId: number,
    commentId: number,
  ): Promise<LikeStatus | null> {
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

    return status as LikeStatus;
  }
}
