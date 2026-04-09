import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GameQueryRepository } from '../../infrastructure/query/game-query.repository';
import { FinishGameService } from '../services/finish-game.service';

@Injectable()
export class GameTimeoutScheduler {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly finishGameService: FinishGameService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleGameTimeouts() {
    const expiredGames =
      await this.gameQueryRepository.findExpiredActiveGames(10000);
    for (const game of expiredGames) {
      const totalQuestions = game.questions.length;
      await this.finishGameService.finishGame(game, totalQuestions);
    }
  }
}
