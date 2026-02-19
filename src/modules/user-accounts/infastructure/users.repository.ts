import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateUserDto } from '../../../modules/user-accounts/dto/create-user.dto';

@Injectable()
export class UsersRepository {
  //инжектирование модели через DI
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(user: CreateUserDto): Promise<number> {
    const query = `
      INSERT INTO users (login, email, "passwordHash", "createdAt")
      VALUES ($1, $2, $3, $4) RETURNING id
    `;

    const params = [user.login, user.email, user.passwordHash, new Date()];

    const result = await this.dataSource.query(query, params);

    return result[0].id;
  }

  async deleteUser(id: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE users 
       SET "deletedAt" = NOW()
       WHERE id = $1 AND "deletedAt" IS NULL`,
    );
  }

  async updatePassword(
    userId: number,
    newPasswordHash: string,
  ): Promise<boolean> {
    const query = `
      UPDATE users 
      SET 
        "passwordHash" = $1,
        "updatedAt" = NOW()
      WHERE id = $2 
        AND "deletedAt" IS NULL
      RETURNING id
    `;

    const result = await this.dataSource.query(query, [
      newPasswordHash,
      userId,
    ]);

    return result.length > 0;
  }
}
