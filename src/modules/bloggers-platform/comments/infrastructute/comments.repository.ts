import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Comment } from '.././../../../modules/bloggers-platform/comments/domain/comment.entity';

@Injectable()
export class CommentsRepository {
  //инжектирование модели через DI
  constructor(private dataSource: DataSource) {}
  async createComment(commentDto: {
    content: string;
    userId: number;
    userLogin: string;
    postId: number;
  }): Promise<Comment> {
    const query = `
      INSERT INTO comments
        ("postId", "content", "userId", "userLogin")
      VALUES
        ($1, $2, $3, $4)
        RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      commentDto.postId,
      commentDto.content,
      commentDto.userId,
      commentDto.userLogin,
    ]);

    return result[0];
  }

  async delete(commentId: number): Promise<boolean> {
    const query = `
      UPDATE comments 
      SET "deletedAt" = CURRENT_TIMESTAMP
      WHERE id = $1 AND "deletedAt" IS NULL
      RETURNING id
    `;

    const result = await this.dataSource.query(query, [commentId]);
    return result.length > 0;
  }
  async update(commentId: number, content: string): Promise<boolean> {
    const query = `
      UPDATE comments 
      SET 
        "content" = $2,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $1 AND "deletedAt" IS NULL
      RETURNING id
    `;

    const result = await this.dataSource.query(query, [commentId, content]);
    return result.length > 0;
  }
}
