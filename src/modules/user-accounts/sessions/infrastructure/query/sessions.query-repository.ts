import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionViewDto } from '../../api/view-dto/sessions.view-dto';
import { Session } from '../../../../../modules/user-accounts/sessions/domain/session.entity';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAllActiveSessionsByUserId(
    userId: string,
  ): Promise<SessionViewDto[]> {
    const userIdNumber = Number(userId);

    const query = `
      SELECT
        ip,
        title,
        "lastActiveDate",
        "deviceId"
      FROM sessions
      WHERE "userId" = $1
        AND "expirationDate" > NOW()
        AND "deletedAt" IS NULL
      ORDER BY "lastActiveDate" DESC
    `;

    const parameters = [userIdNumber];

    try {
      const result = await this.dataSource.query(query, parameters);

      if (!result || result.length === 0) {
        return [];
      }

      // Прямой маппинг без mapRawToSession
      return result.map((session: any) => ({
        ip: session.ip,
        title: session.title,
        lastActiveDate: session.lastActiveDate,
        deviceId: session.deviceId,
      }));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }

  async findByDeviceId(deviceId: string): Promise<Session | null> {
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
      return null;
    }

    return result[0];
  }
}
