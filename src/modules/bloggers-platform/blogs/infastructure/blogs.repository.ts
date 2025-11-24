import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { DataSource } from 'typeorm';
import { Blog } from '../../../bloggers-platform/blogs/domain/dto/blog.entity';
import { CreateBlogDto } from '../../../bloggers-platform/blogs/dto/create-blog.dto';
import { UpdateBlogDto } from '../../../bloggers-platform/blogs/dto/update-blog.dto';

@Injectable()
export class BlogsRepository {
  //инжектирование модели через DI
  constructor(private dataSource: DataSource) {}

  async create(dto: CreateBlogDto): Promise<Blog> {
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

    return result[0] as Blog;
  }

  async update(id: number, dto: UpdateBlogDto): Promise<void> {
    const query = `
        UPDATE blogs 
        SET 
            name = $1,
            description = $2,
            "websiteUrl" = $3,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $4 AND "deletedAt" IS NULL
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
      id,
    ]);

    if (result.rowCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found or already deleted',
      });
    }
  }

  async findOrNotFoundFail(id: number): Promise<Blog> {
    const query = `
      SELECT 
        id,
        name,
        description,
       "websiteUrl",
        "isMembership",
        "createdAt",
        "updatedAt",
        "deletedAt"
      FROM blogs 
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [id]);

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return result[0];
  }

  async delete(id: number): Promise<void> {
    const query = `
      UPDATE blogs 
      SET deletedAt = CURRENT_TIMESTAMP 
      WHERE id = $1 AND deletedAt IS NULL
    `;

    await this.dataSource.query(query, [id]);
  }
}
