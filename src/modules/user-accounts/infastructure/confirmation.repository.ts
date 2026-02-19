import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateConfirmationDto } from '../../../modules/user-accounts/dto/create-confirmation.dto';
import { Confirmation } from '@src/modules/user-accounts/domain/dto/confirmation.entity';

@Injectable()
export class ConfirmationRepository {
  constructor(private dataSource: DataSource) {}

  async createConfirmation(
    confirmation: CreateConfirmationDto,
    userId: number,
  ): Promise<void> {
    const query = `
      INSERT INTO confirmations ("isEmailConfirmed","code", "userId")
      VALUES ($1, $2, $3) 
    `;

    const params = [confirmation.isEmailConfirmed, confirmation.code, userId];

    await this.dataSource.query(query, params);
  }

  async findUserByConfirmationCode(code: string): Promise<Confirmation | null> {
    const query = `
      SELECT *
      FROM confirmations
      WHERE "code" = $1
        AND "codeExpiresAt" > NOW()
        AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [code]);
    return result[0] || null;
  }

  async findUserIdByRecoveryCode(
    recoveryCode: string,
  ): Promise<Confirmation | null> {
    const query = `
      SELECT *
      FROM confirmations
      WHERE "recoveryCode" = $1
        AND "recoveryCodeExpiresAt" > NOW()
        AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [recoveryCode]);
    return result[0] || null;
  }
  async findConfirmationByUserId(userId: number): Promise<Confirmation | null> {
    const query = `
      SELECT *
      FROM confirmations
      WHERE "userId" = $1
        AND "deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [userId]);
    return result[0] || null;
  }

  async setRecoveryCode(
    userId: number,
    recoveryCode: string,
  ): Promise<boolean> {
    const query = `
      UPDATE confirmations 
      SET 
        "recoveryCode" = $1,
        "recoveryCodeCreatedAt" = NOW(),
        "recoveryCodeExpiresAt" = NOW() + INTERVAL '1 hour'
      WHERE "userId" = $2
        RETURNING id
    `;
    const result = await this.dataSource.query(query, [recoveryCode, userId]);
    return result.length > 0;
  }

  async deleteConfirmation(id: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE confirmations 
       SET "deletedAt" = NOW()
       WHERE userId = $1 AND "deletedAt" IS NULL`,
    );
  }
  async clearRecoveryCode(userId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        UPDATE confirmations 
        SET 
          "recoveryCode" = NULL,
          "recoveryCodeCreatedAt" = NULL,
          "recoveryCodeExpiresAt" = NULL
        WHERE "userId" = $1
        `,
      [userId],
    );
    return result[1] > 0;
  }

  async confirmEmail(id: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE confirmations 
    SET 
      "isEmailConfirmed" = true,
      "code" = NULL,
      "codeExpiresAt" = NULL
    WHERE "userId" = $1
    `,
      [id],
    );

    return result[1] > 0;
  }
  async updateConfirmationCode(
    userId: number,
    newCode: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE confirmations 
    SET 
      "code" = $1,
      "codeCreatedAt" = NOW(),
      "codeExpiresAt" = NOW() + INTERVAL '1 hour'  // 1 час = 60 минут
    WHERE "userId" = $2
    `,
      [newCode, userId],
    );

    return result[1] > 0;
  }
}
