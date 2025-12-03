import { Injectable } from '@nestjs/common';
import { UserExternalDto } from './users.external-dto';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getByIdOrNotFoundFail(id: number): Promise<UserExternalDto> {
    const query = `
      SELECT 
        id,
        login,
        email,
       "createdAt",
       "updatedAt",
      "deletedAt"
      FROM users 
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [id]);

    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    const user = result[0];
    return UserExternalDto.mapToView(user);
  }
}
