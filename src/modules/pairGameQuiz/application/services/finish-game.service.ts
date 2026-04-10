// application/services/finish-game.service.ts
import { Injectable } from '@nestjs/common';
import { GameRepository } from '../../infrastructure/game.repository';
import { AnswerRepository } from '../../infrastructure/answers.repository';
import { PlayerProgressRepository } from '../../infrastructure/player-progress.repository';
import { UsersStatisticsRepository } from '../../infrastructure/users-statistics.repository';
import { Game, GameStatus } from '../../domain/game.entity';
import { PlayerProgress } from '../../domain/player-progress.entity';
import { GameQuestion } from '../../domain/game-question.entity';
import { AnswerStatus, PlayerAnswer } from '../../domain/player-answer.entity';

@Injectable()
export class FinishGameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly playerProgressRepository: PlayerProgressRepository,
    private readonly usersStatisticsRepository: UsersStatisticsRepository,
  ) {}

  async finishGame(game: Game, totalQuestions: number): Promise<void> {
    // Не завершаем повторно
    if (game.status !== GameStatus.Active) return;

    const firstProgress = game.firstPlayerProgress;
    const secondProgress = game.secondPlayerProgress;
    if (!firstProgress || !secondProgress) return; // на всякий случай

    // Безопасное получение количества отвеченных вопросов
    const firstAnswersCount = firstProgress.answers?.length ?? 0;
    const secondAnswersCount = secondProgress.answers?.length ?? 0;
    const isFirstFinished = firstAnswersCount === totalQuestions;
    const isSecondFinished = secondAnswersCount === totalQuestions;

    // 1. Добавляем неправильные ответы за пропущенные вопросы (только тем, кто не закончил)
    if (!isFirstFinished) {
      await this.addMissingAnswers(firstProgress, game.questions ?? []);
    }
    if (!isSecondFinished) {
      await this.addMissingAnswers(secondProgress, game.questions ?? []);
    }

    // 2. Бонус за скорость (по времени завершения)
    const firstFinishedAt = game.firstPlayerFinishedAt;
    const secondFinishedAt = game.secondPlayerFinishedAt;

    if (firstFinishedAt && secondFinishedAt) {
      // оба закончили – бонус тому, кто раньше
      if (firstFinishedAt < secondFinishedAt && firstProgress.score > 0) {
        firstProgress.score += 1;
        await this.playerProgressRepository.savePlayerProgress(firstProgress);
      } else if (
        secondFinishedAt < firstFinishedAt &&
        secondProgress.score > 0
      ) {
        secondProgress.score += 1;
        await this.playerProgressRepository.savePlayerProgress(secondProgress);
      }
    } else if (firstFinishedAt && !secondFinishedAt) {
      // закончил только первый – бонус ему
      if (firstProgress.score > 0) {
        firstProgress.score += 1;
        await this.playerProgressRepository.savePlayerProgress(firstProgress);
      }
    } else if (!firstFinishedAt && secondFinishedAt) {
      // закончил только второй – бонус ему
      if (secondProgress.score > 0) {
        secondProgress.score += 1;
        await this.playerProgressRepository.savePlayerProgress(secondProgress);
      }
    }

    // 3. Обновляем статистику игроков (win/loss/draw)
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

  /**
   * Добавляет неправильные ответы за все вопросы, на которые игрок не ответил.
   */
  private async addMissingAnswers(
    playerProgress: PlayerProgress,
    gameQuestions: GameQuestion[],
  ): Promise<void> {
    // ID уже отвеченных вопросов
    const answeredIds = new Set(
      (playerProgress.answers ?? []).map((a) => a.gameQuestion.id),
    );

    // Вопросы, на которые игрок не ответил
    const missingGameQuestions = gameQuestions.filter(
      (q) => !answeredIds.has(q.id),
    );

    if (missingGameQuestions.length === 0) return;

    // Создаём неправильные ответы
    const wrongAnswers = missingGameQuestions.map((gameQuestion) => {
      const wrongAnswer = new PlayerAnswer();
      wrongAnswer.playerProgress = playerProgress;
      wrongAnswer.gameQuestion = gameQuestion;
      wrongAnswer.answerStatus = AnswerStatus.Incorrect;
      wrongAnswer.addedAt = new Date();
      return wrongAnswer;
    });

    // Сохраняем все ответы (можно по одному, если нет batch-репозитория)
    for (const answer of wrongAnswers) {
      await this.answerRepository.saveAnswer(answer);
    }

    // Добавляем в массив прогресса (если он null, создаём новый)
    if (!playerProgress.answers) playerProgress.answers = [];
    playerProgress.answers.push(...wrongAnswers);

    // Сохраняем прогресс
    await this.playerProgressRepository.savePlayerProgress(playerProgress);
  }
}
