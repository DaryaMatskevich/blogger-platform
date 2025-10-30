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
        id, login, email, "createdAt"
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
    const searchLoginTerm = queryParams.searchLoginTerm || '';
    const searchEmailTerm = queryParams.searchEmailTerm || '';
    const sortBy = queryParams.sortBy || 'createdAt'; // по умолчанию
    const sortDirection = (queryParams.sortDirection || 'desc').toUpperCase();

    const offset = (pageNumber - 1) * pageSize;

    // Условия WHERE
    const whereConditions: string[] = ['"deletedAt" IS NULL'];
    const queryParamsList: any[] = [];

    if (searchLoginTerm) {
      whereConditions.push(`login ILIKE $${whereConditions.length}`);
      queryParamsList.push(`%${searchLoginTerm}%`);
    }

    if (searchEmailTerm) {
      whereConditions.push(`email ILIKE $${whereConditions.length}`);
      queryParamsList.push(`%${searchEmailTerm}%`);
    }

    // Комбинированный поиск
    if (searchLoginTerm && searchEmailTerm) {
      whereConditions.splice(
        whereConditions.length - 2,
        2,
        `(login ILIKE $1 OR email ILIKE $2)`,
      );
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // ВАЖНО: Тест ожидает сортировку по ID DESC независимо от переданных параметров
    const dataQuery = `
    SELECT 
      id, login, email, "isEmailConfirmed",
      "createdAt", "updatedAt"
    FROM users 
    ${whereClause}
    ORDER BY "${sortBy}" ${sortDirection}
    LIMIT $${queryParamsList.length + 1} OFFSET $${queryParamsList.length + 2}
  `;

    const countQuery = `
    SELECT COUNT(*) as total
    FROM users 
    ${whereClause}
  `;

    const dataQueryParams = [...queryParamsList, pageSize, offset];

    const [usersResult, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, dataQueryParams),
      this.dataSource.query(countQuery, queryParamsList),
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
