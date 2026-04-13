// application/schedulers/game-timeout.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GameQueryRepository } from '../../infrastructure/query/game-query.repository';
import { FinishGameService } from '../services/finish-game.service';
import { GameStatus } from '../../../../modules/pairGameQuiz/domain/game.entity';

@Injectable()
export class GameTimeoutScheduler {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly finishGameService: FinishGameService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleGameTimeouts() {
    // Находим игры, где один игрок закончил >= 10 секунд назад, а второй ещё нет
    const expiredGames =
      await this.gameQueryRepository.findActiveGamesWithOneFinishedTimeout(10);

    for (const game of expiredGames) {
      // Перед завершением убедимся, что игра всё ещё активна (на всякий случай)
      if (game.status !== GameStatus.Active) continue;

      const totalQuestions = game.questions?.length ?? 0;
      await this.finishGameService.finishGame(game, totalQuestions);
    }
  }
}
