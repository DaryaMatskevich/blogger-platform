import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateBlogDto } from '../../../bloggers-platform/blogs/dto/create-blog.dto';
import { UpdateBlogDto } from '../../../bloggers-platform/blogs/dto/update-blog.dto';

@Injectable()
export class BlogsRepository {
  constructor(private dataSource: DataSource) {}

  async create(dto: CreateBlogDto): Promise<{ id: number }> {
    const query = `
    INSERT INTO blogs (name, description, "websiteUrl", "isMembership")
    VALUES ($1, $2, $3, $4)
    RETURNING 
      id,
      name,
      description,
      "websiteUrl",
      "isMembership",
      "createdAt",
     "updatedAt",
     "deletedAt"
  `;

    const result = await this.dataSource.query(query, [
      dto.name,
      dto.description,
      dto.websiteUrl,
      false, // isMembership по умолчанию
    ]);

    return { id: result[0].id };
  }

  async update(id: number, dto: UpdateBlogDto): Promise<boolean> {
    const query = `
      UPDATE blogs
      SET name         = $1,
          description  = $2,
          "websiteUrl" = $3,
          "updatedAt"  = CURRENT_TIMESTAMP
      WHERE id = $4
        AND "deletedAt" IS NULL`;
    const result = await this.dataSource.query(query, [
      dto.name,
      dto.description,
      dto.websiteUrl,
      id,
    ]);

    return result.length > 0;
  }

  async delete(id: number): Promise<boolean> {
    const query = `
      UPDATE blogs
      SET "deletedAt" = CURRENT_TIMESTAMP
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [id]);
    return result.length > 0;
  }
}
