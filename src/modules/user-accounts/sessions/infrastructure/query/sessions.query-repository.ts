import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionViewDto } from '../../api/view-dto/sessions.view-dto';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAllActiveSessionsByUserId(
    userId: string,
  ): Promise<SessionViewDto[]> {
    const currentDate = new Date();

    const query = `
      SELECT 
        id,
        user_id as "userId",
        ip,
        title,
        last_active_date as "lastActiveDate",
        device_id as "deviceId",
        expiration_date as "expirationDate",
        refresh_token as "refreshToken",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM sessions 
      WHERE user_id = $1 
        AND expiration_date > $2 
        AND deleted_at IS NULL
      ORDER BY last_active_date DESC
    `;

    const parameters = [userId, currentDate];

    try {
      const result = await this.dataSource.query(query, parameters);

      if (!result || result.length === 0) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: 'Sessions not found',
        });
      }

      return result.map((session: any) =>
        SessionViewDto.mapToView(this.mapRawToSession(session)),
      );
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Error fetching sessions',
      });
    }
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<SessionViewDto | null> {
    const query = `
      SELECT 
        id,
        user_id as "userId",
        ip,
        title,
        last_active_date as "lastActiveDate",
        device_id as "deviceId",
        expiration_date as "expirationDate",
        refresh_token as "refreshToken",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM sessions 
      WHERE device_id = $1 
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const parameters = [deviceId];

    try {
      const result = await this.dataSource.query(query, parameters);

      if (!result || result.length === 0) {
        return null;
      }

      return SessionViewDto.mapToView(this.mapRawToSession(result[0]));
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Error fetching session by device ID',
      });
    }
  }

  async findSessionByRefreshToken(
    refreshToken: string,
  ): Promise<SessionViewDto | null> {
    const query = `
      SELECT 
        id,
        user_id as "userId",
        ip,
        title,
        last_active_date as "lastActiveDate",
        device_id as "deviceId",
        expiration_date as "expirationDate",
        refresh_token as "refreshToken",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM sessions 
      WHERE refresh_token = $1 
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const parameters = [refreshToken];

    try {
      const result = await this.dataSource.query(query, parameters);

      if (!result || result.length === 0) {
        return null;
      }

      return SessionViewDto.mapToView(this.mapRawToSession(result[0]));
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Error fetching session by refresh token',
      });
    }
  }

  async isSessionActive(deviceId: string): Promise<boolean> {
    const currentDate = new Date();

    const query = `
      SELECT COUNT(*) as count
      FROM sessions 
      WHERE device_id = $1 
        AND expiration_date > $2 
        AND deleted_at IS NULL
    `;

    const parameters = [deviceId, currentDate];

    try {
      const result = await this.dataSource.query(query, parameters);
      return parseInt(result[0].count) > 0;
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Error checking session activity',
      });
    }
  }

  async getActiveSessionsCount(userId: string): Promise<number> {
    const currentDate = new Date();

    const query = `
      SELECT COUNT(*) as count
      FROM sessions 
      WHERE user_id = $1 
        AND expiration_date > $2 
        AND deleted_at IS NULL
    `;

    const parameters = [userId, currentDate];

    try {
      const result = await this.dataSource.query(query, parameters);
      return parseInt(result[0].count);
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Error counting active sessions',
      });
    }
  }

  async findSessionByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<SessionViewDto | null> {
    const query = `
      SELECT 
        id,
        user_id as "userId",
        ip,
        title,
        last_active_date as "lastActiveDate",
        device_id as "deviceId",
        expiration_date as "expirationDate",
        refresh_token as "refreshToken",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM sessions 
      WHERE user_id = $1 
        AND device_id = $2 
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const parameters = [userId, deviceId];

    try {
      const result = await this.dataSource.query(query, parameters);

      if (!result || result.length === 0) {
        return null;
      }

      return SessionViewDto.mapToView(this.mapRawToSession(result[0]));
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Error fetching session by user ID and device ID',
      });
    }
  }

  // Вспомогательный метод для преобразования сырых данных в объект Session
  private mapRawToSession(raw: any): any {
    return {
      id: raw.id,
      userId: raw.userId,
      ip: raw.ip,
      title: raw.title,
      lastActiveDate: raw.lastActiveDate,
      deviceId: raw.deviceId,
      expirationDate: raw.expirationDate,
      refreshToken: raw.refreshToken,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: null, // Так как мы фильтруем по deleted_at IS NULL
    };
  }
}
