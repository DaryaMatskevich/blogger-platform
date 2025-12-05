import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PostLike } from '../../../../../modules/bloggers-platform/posts/domain/likes/post-like.entity';

@Injectable()
export class PostLikesRepository {
  constructor(private dataSource: DataSource) {}

  async createLike(
    userId: number,
    postId: number,
    status: 'Like' | 'Dislike' | 'None' = 'None',
  ): Promise<PostLike> {
    const query = `
      INSERT INTO "postLikes"
        ( "postId", "userId", status, "createdAt", "updatedAt")
      VALUES 
        ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [postId, userId, status]);
    return result[0];
  }

  async updateLike(
    userId: number,
    postId: number,
    status: 'Like' | 'Dislike' | 'None',
  ): Promise<PostLike | null> {
    const query = `
      UPDATE "postLikes"
      SET 
        status = $1,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE 
        "userId" = $2 AND "postId" = $3
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [status, userId, postId]);

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }
}
