import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../../../../modules/bloggers-platform/posts/dto/update-post.dto';

@Injectable()
export class PostsRepository {
  constructor(private dataSource: DataSource) {}

  async create(dto: CreatePostDto): Promise<{ id: number }> {
    const query = `
      INSERT INTO posts (title,
                         "shortDescription",
                         content,
                         "blogId")
      VALUES ($1, $2, $3, $4) RETURNING 
      id
    `;

    const result = await this.dataSource.query(query, [
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
    ]);

    return { id: result[0].id };
  }

  async update(id: number, dto: UpdatePostDto): Promise<boolean> {
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
      new Date(),
      id,
    ];

    const result = await this.dataSource.query(query, values);

    return result.length > 0;
  }

  async delete(id: number): Promise<boolean> {
    const query = `
      UPDATE posts
      SET "deletedAt" = CURRENT_TIMESTAMP 
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [id]);

    return result.length > 0;
  }
}
