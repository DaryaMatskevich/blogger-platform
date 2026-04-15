// application/services/finish-game.service.ts
import { Injectable } from '@nestjs/common';
import { GameRepository } from '../../infrastructure/game.repository';
import { AnswerRepository } from '../../infrastructure/answers.repository';
import { PlayerProgressRepository } from '../../infrastructure/player-progress.repository';
import { UsersStatisticsRepository } from '../../infrastructure/users-statistics.repository';
import { Game, GameStatus } from '../../domain/game.entity';
import { PlayerProgress } from '../../domain/player-progress.entity';
import { GameQuestion } from '../../domain/game-question.entity';
import { AnswerStatus } from '../../../../modules/pairGameQuiz/domain/player-answer.entity';

@Injectable()
export class FinishGameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly playerProgressRepository: PlayerProgressRepository,
    private readonly usersStatisticsRepository: UsersStatisticsRepository,
  ) {}

  async finishGame(game: Game): Promise<void> {
    // Не завершаем повторно, если игра уже завершена
    if (game.status !== GameStatus.Active) return;

    // Проверяем, что оба прогресса существуют
    if (!game.firstPlayerProgress || !game.secondPlayerProgress) return;

    // Перезагружаем прогрессы, чтобы получить полноценные сущности с id и player
    const firstProgress = await this.playerProgressRepository.findOne({
      where: { id: game.firstPlayerProgress.id },
      relations: ['player'],
    });
    const secondProgress = await this.playerProgressRepository.findOne({
      where: { id: game.secondPlayerProgress.id },
      relations: ['player'],
    });

    if (!firstProgress || !secondProgress) return;

    const isFirstFinished = !!game.firstPlayerFinishedAt;
    const isSecondFinished = !!game.secondPlayerFinishedAt;

    // 1. Добавляем неправильные ответы за пропущенные вопросы
    if (!isFirstFinished) {
      await this.addMissingAnswers(firstProgress, game.questions ?? []);
    }
    if (!isSecondFinished) {
      await this.addMissingAnswers(secondProgress, game.questions ?? []);
    }

    // 2. Бонус за скорость
    const firstFinishedAt = game.firstPlayerFinishedAt;
    const secondFinishedAt = game.secondPlayerFinishedAt;

    if (firstFinishedAt && secondFinishedAt) {
      if (firstFinishedAt < secondFinishedAt) {
        firstProgress.score += 1;
        await this.playerProgressRepository.updateScore(
          firstProgress.id,
          firstProgress.score,
        );
      } else if (secondFinishedAt < firstFinishedAt) {
        secondProgress.score += 1;
        await this.playerProgressRepository.updateScore(
          secondProgress.id,
          secondProgress.score,
        );
      }
    } else if (firstFinishedAt && !secondFinishedAt) {
      firstProgress.score += 1;
      await this.playerProgressRepository.updateScore(
        firstProgress.id,
        firstProgress.score,
      );
    } else if (!firstFinishedAt && secondFinishedAt) {
      secondProgress.score += 1;
      await this.playerProgressRepository.updateScore(
        secondProgress.id,
        secondProgress.score,
      );
    }

    // 3. Обновляем статистику игроков
    let firstResult: 'win' | 'loss' | 'draw' = 'draw';
    let secondResult: 'win' | 'loss' | 'draw' = 'draw';

    if (firstProgress.score > secondProgress.score) {
      firstResult = 'win';
      secondResult = 'loss';
    } else if (firstProgress.score < secondProgress.score) {
      firstResult = 'loss';
      secondResult = 'win';
    }

    await this.usersStatisticsRepository.updateAfterGame(
      firstProgress.player.id,
      firstProgress.score,
      firstResult,
    );
    await this.usersStatisticsRepository.updateAfterGame(
      secondProgress.player.id,
      secondProgress.score,
      secondResult,
    );

    // 4. Завершаем игру
    game.status = GameStatus.Finished;
    game.finishGameDate = new Date();
    await this.gameRepository.saveGame(game);
  }

  private async addMissingAnswers(
    playerProgress: PlayerProgress,
    gameQuestions: GameQuestion[],
  ): Promise<void> {
    if (!playerProgress.id) return;

    const existingAnswers = await this.answerRepository.find({
      where: { playerProgress: { id: playerProgress.id } },
      relations: ['gameQuestion'],
    });

    const answeredIds = new Set(existingAnswers.map((a) => a.gameQuestion.id));
    const missing = gameQuestions.filter((q) => !answeredIds.has(q.id));

    for (const q of missing) {
      // Прямая вставка без сохранения объекта
      await this.answerRepository.forceInsertAnswer(
        playerProgress.id,
        q.id,
        AnswerStatus.Incorrect,
      );
    }
  }
}
