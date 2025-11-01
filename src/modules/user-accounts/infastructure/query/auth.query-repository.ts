import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { DataSource } from 'typeorm';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';

@Injectable()
export class AuthQueryRepository {
  constructor(private dataSource: DataSource) {}

  async me(userId: string): Promise<MeViewDto> {
    // RAW SQL запрос
    const query = `
      SELECT 
        id,
        email, 
        login
      FROM users 
      WHERE id = $1
    `;

    const result = await this.dataSource.query(query, [userId]);

    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `User not found`,
      });
    }
    const user = result[0];

    return MeViewDto.mapToView(user);
  }
}
