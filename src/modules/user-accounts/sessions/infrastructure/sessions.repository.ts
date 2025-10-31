import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Session } from '../domain/session.entity';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { DataSource } from 'typeorm';

interface RawSessionData {
  id: number;
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;
  expirationDate: Date;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

@Injectable()
export class SessionRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  async findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<Session> {
    const query = `
      SELECT
        id,
       "userId",
        ip,
        title,
        "lastActiveDate",
        "deviceId",
        "expirationDate",
        "refreshToken",
        "createdAt",
        "updatedAt",
        "deletedAt"
      FROM sessions
      WHERE "userId" = $1
        AND "deviceId" = $2
        AND "deletedAt" IS NULL
        LIMIT 1
    `;

    const parameters = [userId, deviceId];

    try {
      const result: RawSessionData[] = await this.dataSource.query(
        query,
        parameters,
      );

      if (!result || result.length === 0) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: 'Session not found',
        });
      }

      return this.mapRawToSession(result[0]);
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Error finding session by user ID and device ID',
      });
    }
  }

  async findByDeviceId(deviceId: string): Promise<Session> {
    const query = `
      SELECT
        id,
        "userId",
        ip,
        title,
        "lastActiveDate",
       "deviceId",
        "expirationDate",
        "refreshToken",
       "createdAt",
       "updatedAt",
        "deletedAt"
      FROM sessions
      WHERE "deviceId" = $1
        AND "deletedAt" IS NULL
        
    `;

    const result = await this.dataSource.query(query, [deviceId]);

    if (!result || result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }

    return this.mapRawToSession(result[0]);
  }

  async save(session: Session): Promise<Session> {
    if (session.id) {
      return await this.update(session);
    } else {
      return await this.create(session);
    }
  }

  private async create(session: Session): Promise<Session> {
    const query = `
      INSERT INTO sessions (
        "userId", ip, title, "lastActiveDate", "deviceId",
        "expirationDate", "refreshToken", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING 
        id,
      "userId",
        ip,
        title,
        "lastActiveDate",
       "deviceId",
        "expirationDate",
        "refreshToken",
        "createdAt",
        "updatedAt",
        "deletedAt"
    `;

    const parameters = [
      session.userId,
      session.ip,
      session.title,
      session.lastActiveDate,
      session.deviceId,
      session.expirationDate,
      session.refreshToken,
      new Date(),
      new Date(),
    ];

    try {
      const result = await this.dataSource.query(query, parameters);
      return this.mapRawToSession(result[0]);
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Error creating session',
      });
    }
  }

  private async update(session: Session): Promise<Session> {
    const query = `
      UPDATE sessions
      SET
        ip = $1,
        title = $2,
        "lastActiveDate" = $3,
        "expirationDate" = $4,
        "refreshToken" = $5,
        "updatedAt" = $6
      WHERE id = $7
        AND "deletedAt" IS NULL
        RETURNING 
        id,
        "userId",
        ip,
        title,
        "lastActiveDate",
        "deviceId",
        "expirationDate",
        "refreshToken",
        "createdAt",
        "updatedAt",
        "deletedAt"
    `;

    const parameters = [
      session.ip,
      session.title,
      session.lastActiveDate,
      session.expirationDate,
      session.refreshToken,
      new Date(),
      session.id,
    ];

    try {
      const result = await this.dataSource.query(query, parameters);

      if (!result || result.length === 0) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: 'Session not found for update',
        });
      }

      return this.mapRawToSession(result[0]);
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Error updating session',
      });
    }
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
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Error deleting session',
      });
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

    try {
      const result = await this.dataSource.query(query, parameters);
      return result.length > 0;
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Error deleting sessions',
      });
    }
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    const query = `
      SELECT
        id,
       "userId",
        ip,
        title,
       "lastActiveDate",
      "deviceId",
        "expirationDate",
        "refreshToken",
        "createdAt",
        "updatedAt",
        "deletedAt"
      FROM sessions
      WHERE "refreshToken" = $1
        AND "deletedAt" IS NULL
        LIMIT 1
    `;

    const parameters = [refreshToken];

    try {
      const result = await this.dataSource.query(query, parameters);

      if (!result || result.length === 0) {
        return null;
      }

      return this.mapRawToSession(result[0]);
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Error finding session by refresh token',
      });
    }
  }

  async hardDeleteSession(deviceId: string): Promise<boolean> {
    const query = `
      DELETE FROM sessions
      WHERE "deviceId" = $1
        RETURNING id
    `;

    const parameters = [deviceId];

    try {
      const result = await this.dataSource.query(query, parameters);
      return result.length > 0;
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Error hard deleting session',
      });
    }
  }

  async findAllActiveSessionsByUserId(userId: string): Promise<Session[]> {
    const query = `
      SELECT 
        id,
       "userId",
        ip,
        title,
        "lastActiveDate",
       "deviceId",
        "expirationDate",
        "refreshToken",
      "createdAt",
       "updatedAt",
        "deletedAt"
      FROM sessions 
      WHERE "userId" = $1 
        AND "deletedAt" IS NULL
      ORDER BY "lastActiveDate" DESC
    `;

    const parameters = [userId];

    try {
      const result = await this.dataSource.query(query, parameters);
      return result.map((raw: RawSessionData) => this.mapRawToSession(raw));
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Error finding active sessions by user ID',
      });
    }
  }

  async deleteExpiredSessions(): Promise<number> {
    const query = `
      UPDATE sessions 
      SET "deletedAt" = $1
      WHERE "expirationDate" < $2 
        AND "deletedAt" IS NULL
      RETURNING id
    `;

    const parameters = [new Date(), new Date()];

    try {
      const result = await this.dataSource.query(query, parameters);
      return result.length;
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Error deleting expired sessions',
      });
    }
  }

  private mapRawToSession(raw: RawSessionData): Session {
    const session = new Session();
    session.id = raw.id;
    session.userId = raw.userId;
    session.ip = raw.ip;
    session.title = raw.title;
    session.lastActiveDate = new Date(raw.lastActiveDate);
    session.deviceId = raw.deviceId;
    session.expirationDate = new Date(raw.expirationDate);
    session.refreshToken = raw.refreshToken;
    session.createdAt = new Date(raw.createdAt);
    session.updatedAt = new Date(raw.updatedAt);
    session.deletedAt = raw.deletedAt ? new Date(raw.deletedAt) : null;
    return session;
  }
}
