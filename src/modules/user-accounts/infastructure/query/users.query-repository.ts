import { MeViewDto, UserViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable } from '@nestjs/common';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { DataSource } from 'typeorm';
import { User } from '../../../../modules/user-accounts/domain/dto/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getById(id: number): Promise<UserViewDto> {
    const query = `
      SELECT 
        id, login, email, "createdAt"
      FROM users 
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [id]);
    const user = result[0];

    return UserViewDto.mapToView(user);
  }

  async getByIdRaw(id: number): Promise<User | null> {
    const query = `
      SELECT
        id, login, email, "passwordHash",
        "createdAt", "updatedAt", "deletedAt"
      FROM users
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [id]);

    if (result.length === 0) {
      return null;
    }

    // Возвращаем как есть, без маппинга
    return result[0] as User;
  }

  async getAll(
    queryParams: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const pageNumber = queryParams.pageNumber || 1;
    const pageSize = queryParams.pageSize || 10;
    const searchLoginTerm = queryParams.searchLoginTerm || '';
    const searchEmailTerm = queryParams.searchEmailTerm || '';
    const sortBy = queryParams.sortBy || 'createdAt';
    const sortDirection = (queryParams.sortDirection || 'desc').toUpperCase();

    const offset = (pageNumber - 1) * pageSize;

    // Массив для параметров запроса
    const queryParamsList: any[] = [];
    let paramIndex = 1;

    // Базовое условие WHERE
    let whereClause = '"deletedAt" IS NULL';

    // Обработка поисковых терминов
    if (searchLoginTerm || searchEmailTerm) {
      const searchConditions: string[] = [];

      if (searchLoginTerm) {
        searchConditions.push(`login ILIKE $${paramIndex++}`);
        queryParamsList.push(`%${searchLoginTerm}%`);
      }

      if (searchEmailTerm) {
        searchConditions.push(`email ILIKE $${paramIndex++}`);
        queryParamsList.push(`%${searchEmailTerm}%`);
      }

      // Объединяем через OR если есть оба условия
      whereClause += ` AND (${searchConditions.join(' OR ')})`;
    }

    // Подготовка сортировки
    let orderByClause = '';
    if (String(sortBy) === 'createdAt') {
      // Если сортировка по createdAt, то добавляем ID как второй критерий
      orderByClause = `ORDER BY "${sortBy}" ${sortDirection}, id DESC`;
    } else {
      // Для других полей сортируем по указанному полю
      orderByClause = `ORDER BY "${sortBy}" ${sortDirection}`;
    }

    // Основной запрос данных - БЕЗ isEmailConfirmed
    const dataQuery = `
      SELECT
        id,
        login,
        email,
        "createdAt",
        "updatedAt"
      FROM users
      WHERE ${whereClause}
        ${orderByClause}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Запрос для подсчета общего количества
    const countQuery = `
    SELECT COUNT(*) as total
    FROM users 
    WHERE ${whereClause}
  `;

    // Параметры для запроса данных (добавляем pageSize и offset)
    const dataQueryParams = [...queryParamsList, pageSize, offset];

    const [usersResult, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, dataQueryParams),
      this.dataSource.query(countQuery, queryParamsList),
    ]);

    const totalCount = parseInt(countResult[0].total);
    const items = usersResult.map((user: any) => UserViewDto.mapToView(user));

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items,
    });
  }

  async me(userId: string): Promise<MeViewDto | null> {
    // RAW SQL запрос
    const query = `
      SELECT 
        id,
        email, 
        login
      FROM users 
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [userId]);

    if (result.length === 0) {
      return null;
    }
    const user = result[0];

    return MeViewDto.mapToView(user);
  }

  async findByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<User | null> {
    const query = `
    SELECT * FROM users 
    WHERE login = $1 OR email = $2
  `;
    const result = await this.dataSource.query(query, [login, email]);
    return result[0] || null;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const query = `
    SELECT * FROM users 
    WHERE login = $1 OR email = $1
  `;
    const result = await this.dataSource.query(query, [loginOrEmail]);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
    SELECT * FROM users 
    WHERE email = $1 
  `;
    const result = await this.dataSource.query(query, [email]);
    return result[0] || null;
  }
}
