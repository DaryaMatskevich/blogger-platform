import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommentLike } from '../../../../../modules/bloggers-platform/comments/domain/comment-like.entity';

@Injectable()
export class LikesCommentRepository {
  constructor(private dataSource: DataSource) {}

  async createLike(
    userId: number,
    commentId: number,
    status: 'Like' | 'Dislike' | 'None' = 'None',
  ): Promise<CommentLike> {
    const query = `
      INSERT INTO commentsLikes 
        ("userId", "commentId", status, "createdAt", "updatedAt")
      VALUES 
        ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      userId,
      commentId,
      status,
    ]);
    return result[0];
  }

  async updateLike(
    userId: number,
    commentId: number,
    status: 'Like' | 'Dislike' | 'None',
  ): Promise<CommentLike | null> {
    const query = `
      UPDATE commentsLikes 
      SET 
        status = $1,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE 
        "userId" = $2 AND "commentId" = $3
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      status,
      userId,
      commentId,
    ]);

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }
}
