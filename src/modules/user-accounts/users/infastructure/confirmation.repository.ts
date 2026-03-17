import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateConfirmationDto } from '../../../../modules/user-accounts/users/dto/create-confirmation.dto';
import { Confirmation } from '../../../../modules/user-accounts/users/domain/confirmation.entity';
import { UpdateConfirmationCodeDto } from '../../../../modules/user-accounts/users/dto/update-confirmation.dto';

@Injectable()
export class ConfirmationRepository extends Repository<Confirmation> {
  constructor(private dataSource: DataSource) {
    super(Confirmation, dataSource.createEntityManager());
  }

  async createConfirmation(
    confirmation: CreateConfirmationDto,
    userId: number,
  ): Promise<void> {
    const query = `
      INSERT INTO confirmations ("isEmailConfirmed","code","codeExpiresAt", "userId")
      VALUES ($1, $2, $3, $4 ) 
    `;

    const params = [
      confirmation.isEmailConfirmed,
      confirmation.code,
      confirmation.codeExpiresAt,
      userId,
    ];

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
    console.log(result[0]);
    return result[0] || null;
  }

  async findConfirmationByRecoveryCode(
    recoveryCode: string,
  ): Promise<Confirmation | null> {
    const confirmation = await this.dataSource
      .getRepository(Confirmation)
      .createQueryBuilder('confirmation')
      .where('confirmation.recoveryCode = :recoveryCode', { recoveryCode })
      // .andWhere('confirmation.recoveryCodeExpiresAt > NOW()')
      .andWhere('confirmation.deletedAt IS NULL')
      .getOne();

    console.log(confirmation);
    return confirmation;
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
        RETURNING "userId"
    `;
    const result = await this.dataSource.query(query, [recoveryCode, userId]);
    return result.length > 0;
  }

  async deleteConfirmation(userId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE confirmations 
       SET "deletedAt" = NOW()
       WHERE "userId" = $1 AND "deletedAt" IS NULL
         RETURNING "userId"`,
      [userId],
    );
    return result[0].length > 0;
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
    dto: UpdateConfirmationCodeDto,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE confirmations 
    SET 
      "code" = $1,
      "codeCreatedAt" = $2,
      "codeExpiresAt" = $3
    WHERE "userId" = $4
    `,
      [dto.newCode, dto.createdAt, dto.expiresAt, dto.userId],
    );

    return result[1] > 0;
  }
}
