import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(private dataSource: DataSource) {}

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
    queryParams: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const pageNumber = queryParams.pageNumber || 1;
    const pageSize = queryParams.pageSize || 10;
    const sortBy = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    // PAGINATION
    const offset = (pageNumber - 1) * pageSize;

    // Запрос для данных
    const dataQuery = `
      SELECT 
        id, login, email, "isEmailConfirmed",
        "createdAt", "updatedAt"
      FROM users 
      WHERE "deletedAt" IS NULL
      ORDER BY "${sortBy}" ${sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
      LIMIT $1 OFFSET $2
    `;

    // Запрос для общего количества
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users 
      WHERE "deletedAt" IS NULL
    `;

    // Выполняем оба запроса
    const [usersResult, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, [pageSize, offset]),
      this.dataSource.query(countQuery),
    ]);

    const totalCount = parseInt(countResult[0].total);
    const items = usersResult.map((user: any) => UserViewDto.mapToView(user));

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      size: pageSize,
      totalCount,
      items,
    });
  }
}
