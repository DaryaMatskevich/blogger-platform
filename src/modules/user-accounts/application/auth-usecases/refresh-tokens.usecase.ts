import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';

import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { SessionRepository } from '../../../../modules/user-accounts/sessions/infrastructure/sessions.repository';

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

    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async execute(
    command: RefreshTokensCommand,
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const session = await this.sessionsRepository.findByDeviceId(
      command.deviceId,
    );

    if (session.userId !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    const newAccessToken = this.accessTokenContext.sign({ id: command.userId });

    const newRefreshToken = this.refreshTokenContext.sign({
      userId: command.userId,
      deviceId: command.deviceId,
    });

    const now = new Date();
    session.updateLastActiveDate(now);
    session.updateRefreshToken(newRefreshToken);
    await this.sessionsRepository.save(session);

    return {
      newAccessToken,
      newRefreshToken,
    };
  }
}
