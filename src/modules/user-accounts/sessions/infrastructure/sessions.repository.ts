import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Session } from '../domain/session.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  async create(sessionData: Partial<Session>): Promise<void> {
    const query = `
      INSERT INTO sessions (
        "userId", ip, title, "deviceId", "refreshToken", "lastActiveDate",
        "expirationDate", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        
    `;

    const parameters = [
      sessionData.userId,
      sessionData.ip,
      sessionData.title,
      sessionData.deviceId,
      sessionData.refreshToken,
      sessionData.lastActiveDate,
      sessionData.expirationDate,
    ];
    await this.dataSource.query(query, parameters);
  }

  async deleteSessionById(deviceId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE sessions
      SET "deletedAt" = $1
      WHERE "deviceId" = $2
        AND "userId" = $3
        AND "deletedAt" IS NULL
        RETURNING id
    `;

    const parameters = [new Date(), deviceId, userId];

    try {
      const result = await this.dataSource.query(query, parameters);
      return result.length > 0;
    } catch {
      return false;
    }
  }

  async deleteAllSessionsExcludeCurrent(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const query = `
      UPDATE sessions
      SET "deletedAt" = $1
      WHERE "userId" = $2
        AND "deviceId" != $3
        AND "deletedAt" IS NULL
        RETURNING id
    `;

    const parameters = [new Date(), userId, deviceId];

    const result = await this.dataSource.query(query, parameters);
    return result.length > 0;
  }
  async updateSessionRefreshToken(
    deviceId: string,
    userId: string,
    refreshToken: string,
    lastActiveDate: Date,
  ): Promise<boolean> {
    const query = `
    UPDATE sessions 
    SET "refreshToken" = $1, 
        "lastActiveDate" = $2,
        "updatedAt" = NOW()
    WHERE "deviceId" = $3 AND "userId" = $4
  `;

    const parameters = [refreshToken, lastActiveDate, deviceId, userId];
    const result = await this.dataSource.query(query, parameters);

    return result.rowCount > 0;
  }
}
