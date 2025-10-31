import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';

import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { SessionRepository } from '../../sessions/infrastructure/sessions.repository';
import { DataSource } from 'typeorm';

export class RefreshTokensCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase
  implements ICommandHandler<RefreshTokensCommand>
{
  constructor(
    private sessionsRepository: SessionRepository,
    private dataSource: DataSource,

    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async execute(
    command: RefreshTokensCommand,
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const { userId, deviceId } = command;
    const session = await this.sessionsRepository.findByDeviceId(
      command.deviceId,
    );

    if (session.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    const newAccessToken = this.accessTokenContext.sign({ id: userId });

    const newRefreshToken = this.refreshTokenContext.sign({
      userId: userId,
      deviceId: deviceId,
    });

    const now = new Date();
    await this.dataSource.query(
      `UPDATE sessions 
       SET "refreshToken" = $1, 
           "lastActiveDate" = $2,
           "updatedAt" = NOW()
       WHERE "deviceId" = $3 AND "userId" = $4`,
      [newRefreshToken, now, deviceId, userId],
    );

    return {
      newAccessToken,
      newRefreshToken,
    };
  }
}
