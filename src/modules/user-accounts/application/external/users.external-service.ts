import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infastructure/users.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersExternalService {
  constructor(
    //инжектирование модели в сервис через DI
    @InjectDataSource()
    private dataSource: DataSource,
    private usersRepository: UsersRepository,
  ) {}

  async makeUserAsSpammer(userId: string) {
    const query = `
      UPDATE users 
      SET 
        is_spammer = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [userId]);

    if (result.length === 0) {
      throw new Error('User not found or already deleted');
    }
  }

  // Вариант 3: С проверкой существования пользователя
  async makeUserAsSpammerWithCheck(userId: string): Promise<void> {
    // Сначала проверяем существование пользователя
    const checkQuery = `
      SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL
    `;
    const userExists = await this.dataSource.query(checkQuery, [userId]);

    if (userExists.length === 0) {
      throw new Error('User not found or deleted');
    }

    // Затем обновляем
    const updateQuery = `
      UPDATE users 
      SET 
        is_spammer = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.dataSource.query(updateQuery, [userId]);
  }
}
