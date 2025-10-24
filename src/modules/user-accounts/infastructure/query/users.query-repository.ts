import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const query = `
      SELECT 
        id, login, email, "isEmailConfirmed",
        "createdAt", "updatedAt"
      FROM users 
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [id]);
    const user = result[0];

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const whereConditions: string[] = ['"deletedAt" IS NULL'];
    const queryParams: any[] = [];

    // Поиск по login
    if (query.searchLoginTerm) {
      whereConditions.push(`login ILIKE $${whereConditions.length + 1}`);
      queryParams.push(`%${query.searchLoginTerm}%`);
    }

    // Поиск по email (если нужно)
    if (query.searchEmailTerm) {
      whereConditions.push(`email ILIKE $${whereConditions.length + 1}`);
      queryParams.push(`%${query.searchEmailTerm}%`);
    }

    // Комбинированный поиск по login и email (если нужно)
    if (query.searchLoginTerm && !query.searchEmailTerm) {
      whereConditions.push(`login ILIKE $${whereConditions.length + 1}`);
      queryParams.push(`%${query.searchLoginTerm}%`);
    } else if (!query.searchLoginTerm && query.searchEmailTerm) {
      whereConditions.push(`email ILIKE $${whereConditions.length + 1}`);
      queryParams.push(`%${query.searchEmailTerm}%`);
    } else if (query.searchLoginTerm && query.searchEmailTerm) {
      whereConditions.push(
        `(login ILIKE $${whereConditions.length + 1} OR email ILIKE $${whereConditions.length + 2})`,
      );
      queryParams.push(
        `%${query.searchLoginTerm}%`,
        `%${query.searchEmailTerm}%`,
      );
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // ORDER BY
    const sortBy = query.sortBy || 'createdAt';
    const rawSortDirection = query.sortDirection || 'desc';
    const sortDirection =
      rawSortDirection.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const orderByClause = `ORDER BY "${sortBy}" ${sortDirection}`;

    // PAGINATION
    const offset = query.calculateSkip
      ? query.calculateSkip()
      : (query.pageNumber - 1) * query.pageSize;
    const limit = query.pageSize;

    // Запрос для данных
    const dataQuery = `
      SELECT 
        id, login, email, "isEmailConfirmed",
        "createdAt", "updatedAt"
      FROM users 
      ${whereClause}
      ${orderByClause}
      LIMIT $${whereConditions.length + 1} OFFSET $${whereConditions.length + 2}
    `;

    // Запрос для общего количества
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users 
      ${whereClause}
    `;

    const dataParams = [...queryParams, limit, offset];

    // Выполняем оба запроса параллельно
    const [usersResult, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, dataParams),
      this.dataSource.query(countQuery, queryParams),
    ]);

    const totalCount = parseInt(countResult[0].total);
    const items = usersResult.map((user: any) => UserViewDto.mapToView(user));

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }
}
