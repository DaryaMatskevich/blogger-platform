import { Injectable } from '@nestjs/common';
import { BlogExternalDto } from './blogs.external-dto';
import { DataSource } from 'typeorm';
import { DomainException } from '../../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../../core/exeptions/domain-exeption-codes';

@Injectable()
export class BlogsExternalQueryRepository {
  constructor(private dataSource: DataSource) {}

  async findOrNotFoundFail(id: number): Promise<BlogExternalDto> {
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
    const blog = result[0];
    return BlogExternalDto.mapToView(blog);
  }
}
