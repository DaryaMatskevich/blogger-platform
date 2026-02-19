import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';

import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { SessionsRepository } from '../../sessions/infrastructure/sessions.repository';
import { SessionsQueryRepository } from '../../../../modules/user-accounts/sessions/infrastructure/query/sessions.query-repository';

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
    private sessionsRepository: SessionsRepository,
    private sessionsQueryRepository: SessionsQueryRepository,

    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async execute(
    command: RefreshTokensCommand,
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const { userId, deviceId } = command;
    const session = await this.sessionsQueryRepository.findByDeviceId(
      command.deviceId,
    );

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad Request',
      });
    }

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
    const updated = await this.sessionsRepository.updateSessionRefreshToken(
      deviceId,
      userId,
      newRefreshToken,
      now,
    );

    if (!updated) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Failed to update session',
      });
    }
    return {
      newAccessToken,
      newRefreshToken,
    };
  }
}
