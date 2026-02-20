import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { DataSource } from 'typeorm';
import { Blog } from '../../domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(private dataSource: DataSource) {}

  async findBlogById(id: number): Promise<Blog | null> {
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
    return result[0] || null;
  }

  async blogExists(id: number): Promise<boolean> {
    const query = `
      SELECT id 
      FROM blogs 
      WHERE id = $1 AND "deletedAt" IS NULL
      LIMIT 1
    `;

    const result = await this.dataSource.query(query, [id]);
    return result.length > 0;
  }

  async getByIdOrNotFoundFail(id: number): Promise<BlogViewDto> {
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

    if (!result || result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    const blog = result[0];

    return BlogViewDto.mapToView(blog);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const whereConditions: string[] = ['"deletedAt" IS NULL'];
    const queryParams: any[] = [];
    let paramCount = 1;

    // Добавляем поиск по имени если есть
    if (query.searchNameTerm) {
      whereConditions.push(`name ILIKE $${paramCount}`);
      queryParams.push(`%${query.searchNameTerm}%`);
      paramCount++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // Определяем направление сортировки
    const sortDirection =
      query.sortDirection.toString() === 'asc' ? 'ASC' : 'DESC';

    // Экранируем имя поля для сортировки
    const sortBy = `"${query.sortBy}"`;

    // Получаем данные с пагинацией
    const dataQuery = `
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
    ${whereClause}
    ORDER BY ${sortBy} ${sortDirection}
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

    // Получаем общее количество
    const countQuery = `
    SELECT COUNT(*) as "totalCount"
    FROM blogs 
    ${whereClause}
  `;

    // Выполняем запросы
    const blogsResult = await this.dataSource.query(dataQuery, [
      ...queryParams,
      query.pageSize,
      query.calculateSkip(),
    ]);

    const countResult = await this.dataSource.query(countQuery, queryParams);
    const totalCount = parseInt(countResult[0].totalCount, 10);

    // Маппим результаты
    const items = blogsResult.map((blog) => BlogViewDto.mapToView(blog));

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }
}
