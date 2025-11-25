import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePostDomainDto } from '../../../bloggers-platform/posts/domain/create-post.domain.dto';
import { Post } from '../../../bloggers-platform/posts/domain/post.entity';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';

@Injectable()
export class PostsRepository {
  //инжектирование модели через DI
  constructor(private dataSource: DataSource) {}
  async create(dto: CreatePostDomainDto): Promise<Post> {
    const query = `
      INSERT INTO posts (
        title, 
        "shortDescription", 
        content, 
        "blogId", 
        "blogName",
        
      ) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id,
        title,
        "shortDescription",
        content,
        "blogId",
        "blogName",
        "createdAt",
        "updatedAt",
        "deletedAt",
        
    `;

    const result = await this.dataSource.query(query, [
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
      dto.blogName,
    ]);

    return result[0] as Post;
  }

  async update(
    id: number,
    dto: { title: string; shortDescription: string; content: string },
  ): Promise<void> {
    const query = `
      UPDATE posts
      SET
        title = $1,
        "shortDescription" = $2,
        content = $3,
        "updatedAt" = $4
      WHERE id = $5
    `;

    const values = [
      dto.title,
      dto.shortDescription,
      dto.content,
      new Date().toISOString(),
      id,
    ];

    const result = await this.dataSource.query(query, values);

    if (result[1] === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
  }

  async delete(id: number): Promise<void> {
    const query = `
      UPDATE posts
      SET deletedAt = CURRENT_TIMESTAMP 
      WHERE id = $1 AND deletedAt IS NULL
    `;

    await this.dataSource.query(query, [id]);
  }
}
