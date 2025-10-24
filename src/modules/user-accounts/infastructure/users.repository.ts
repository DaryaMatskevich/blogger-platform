import { Injectable } from '@nestjs/common';
import { User } from '../domain/dto/user.entity';
import { DomainException } from '../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../core/exeptions/domain-exeption-codes';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository {
  //инжектирование модели через DI
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT 
        id, login, "passwordHash", email, "isEmailConfirmed", 
        "confirmationCode", "confirmationCodeCreatedAt", "confirmationCodeExpiresAt",
        "recoveryCode", "recoveryCodeCreatedAt", "recoveryCodeExpiresAt",
        "createdAt", "updatedAt", "deletedAt"
      FROM users 
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [id]);
    return result[0] || null;
  }

  async save(user: User) {
    if (user.id) {
      // Update existing user
      const query = `
            UPDATE users 
            SET 
                login = $1, 
                "passwordHash" = $2, 
                email = $3, 
                "isEmailConfirmed" = $4,
                "confirmationCode" = $5, 
                "confirmationCodeCreatedAt" = $6, 
                "confirmationCodeExpiresAt" = $7,
                "recoveryCode" = $8, 
                "recoveryCodeCreatedAt" = $9, 
                "recoveryCodeExpiresAt" = $10,
                "updatedAt" = $11, 
                "deletedAt" = $12
            WHERE id = $13
        `;

      await this.dataSource.query(query, [
        user.login,
        user.passwordHash,
        user.email,
        user.isEmailConfirmed,
        user.confirmationCode,
        user.confirmationCodeCreatedAt,
        user.confirmationCodeExpiresAt,
        user.recoveryCode,
        user.recoveryCodeCreatedAt,
        user.recoveryCodeExpiresAt,
        new Date(), // updatedAt
        user.deletedAt,
        user.id,
      ]);
    } else {
      // Insert new user
      const query = `
            INSERT INTO users (
                login, "passwordHash", email, "isEmailConfirmed",
                "confirmationCode", "confirmationCodeCreatedAt", "confirmationCodeExpiresAt",
                "recoveryCode", "recoveryCodeCreatedAt", "recoveryCodeExpiresAt",
                "createdAt", "updatedAt", "deletedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id
        `;

      const result = await this.dataSource.query(query, [
        user.login,
        user.passwordHash,
        user.email,
        user.isEmailConfirmed,
        user.confirmationCode,
        user.confirmationCodeCreatedAt,
        user.confirmationCodeExpiresAt,
        user.recoveryCode,
        user.recoveryCodeCreatedAt,
        user.recoveryCodeExpiresAt,
        new Date(), // createdAt
        new Date(), // updatedAt
        user.deletedAt,
      ]);

      // Присваиваем сгенерированный ID обратно объекту пользователя
      user.id = result[0].id;
    }
  }

  async findOrNotFoundFail(id: string): Promise<User> {
    const query = `
    SELECT 
      id, login, "passwordHash", email, "isEmailConfirmed", 
      "confirmationCode", "confirmationCodeCreatedAt", "confirmationCodeExpiresAt",
      "recoveryCode", "recoveryCodeCreatedAt", "recoveryCodeExpiresAt",
      "createdAt", "updatedAt", "deletedAt"
    FROM users 
    WHERE id = $1 AND "deletedAt" IS NULL
  `;

    const result = await this.dataSource.query(query, [id]);
    const user = result[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const query = `
      SELECT 
        id, login, "passwordHash", email, "isEmailConfirmed", 
        "confirmationCode", "confirmationCodeCreatedAt", "confirmationCodeExpiresAt",
        "recoveryCode", "recoveryCodeCreatedAt", "recoveryCodeExpiresAt",
        "createdAt", "updatedAt", "deletedAt"
      FROM users 
      WHERE (login = $1 OR email = $1) AND "deletedAt" IS NULL
    `;
    const result = await this.dataSource.query(query, [loginOrEmail]);
    return result[0] || null;
  }

  async findByLogin(login: string): Promise<User | null> {
    const query = `
      SELECT 
        id, login, "passwordHash", email, "isEmailConfirmed", 
        "confirmationCode", "confirmationCodeCreatedAt", "confirmationCodeExpiresAt",
        "recoveryCode", "recoveryCodeCreatedAt", "recoveryCodeExpiresAt",
        "createdAt", "updatedAt", "deletedAt"
      FROM users 
      WHERE login = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [login]);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT 
        id, login, "passwordHash", email, "isEmailConfirmed", 
        "confirmationCode", "confirmationCodeCreatedAt", "confirmationCodeExpiresAt",
        "recoveryCode", "recoveryCodeCreatedAt", "recoveryCodeExpiresAt",
        "createdAt", "updatedAt", "deletedAt"
      FROM users 
      WHERE email = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [email]);
    return result[0] || null;
  }

  async loginIsExist(login: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count 
      FROM users 
      WHERE login = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [login]);
    return parseInt(result[0].count) > 0;
  }

  async findUserByConfirmationCode(code: string): Promise<User | null> {
    const query = `
      SELECT 
        id, login, "passwordHash", email, "isEmailConfirmed", 
        "confirmationCode", "confirmationCodeCreatedAt", "confirmationCodeExpiresAt",
        "recoveryCode", "recoveryCodeCreatedAt", "recoveryCodeExpiresAt",
        "createdAt", "updatedAt", "deletedAt"
      FROM users 
      WHERE "confirmationCode" = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [code]);
    return result[0] || null;
  }

  async findUserByRecoveryCode(code: string): Promise<User | null> {
    const query = `
      SELECT 
        id, login, "passwordHash", email, "isEmailConfirmed", 
        "confirmationCode", "confirmationCodeCreatedAt", "confirmationCodeExpiresAt",
        "recoveryCode", "recoveryCodeCreatedAt", "recoveryCodeExpiresAt",
        "createdAt", "updatedAt", "deletedAt"
      FROM users 
      WHERE "recoveryCode" = $1 AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [code]);
    return result[0] || null;
  }
}
