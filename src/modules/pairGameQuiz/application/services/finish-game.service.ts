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
    // Не завершаем повторно, если игра уже завершена
    if (game.status !== GameStatus.Active) return;

    const firstProgress = game.firstPlayerProgress;
    const secondProgress = game.secondPlayerProgress;
    if (!firstProgress || !secondProgress) return;

    const firstAnswersCount = firstProgress.answers?.length ?? 0;
    const secondAnswersCount = secondProgress.answers?.length ?? 0;
    const isFirstFinished = firstAnswersCount === totalQuestions;
    const isSecondFinished = secondAnswersCount === totalQuestions;

    // 1. Добавляем неправильные ответы за пропущенные вопросы (тем, кто не успел)
    if (!isFirstFinished) {
      await this.addMissingAnswers(firstProgress, game.questions ?? []);
    }
    if (!isSecondFinished) {
      await this.addMissingAnswers(secondProgress, game.questions ?? []);
    }

    // 2. Бонус за скорость (по времени завершения) – теперь без проверки score > 0
    const firstFinishedAt = game.firstPlayerFinishedAt;
    const secondFinishedAt = game.secondPlayerFinishedAt;

    if (firstFinishedAt && secondFinishedAt) {
      // оба закончили – бонус тому, кто раньше
      if (firstFinishedAt < secondFinishedAt) {
        firstProgress.score += 1;
        await this.playerProgressRepository.savePlayerProgress(firstProgress);
      } else if (secondFinishedAt < firstFinishedAt) {
        secondProgress.score += 1;
        await this.playerProgressRepository.savePlayerProgress(secondProgress);
      }
    } else if (firstFinishedAt && !secondFinishedAt) {
      // закончил только первый – бонус ему
      firstProgress.score += 1;
      await this.playerProgressRepository.savePlayerProgress(firstProgress);
    } else if (!firstFinishedAt && secondFinishedAt) {
      // закончил только второй – бонус ему
      secondProgress.score += 1;
      await this.playerProgressRepository.savePlayerProgress(secondProgress);
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
    const answeredIds = new Set(
      (playerProgress.answers ?? []).map((a) => a.gameQuestion.id),
    );

    const missingGameQuestions = gameQuestions.filter(
      (q) => !answeredIds.has(q.id),
    );

    if (missingGameQuestions.length === 0) return;

    const wrongAnswers = missingGameQuestions.map((gameQuestion) => {
      const wrongAnswer = new PlayerAnswer();
      wrongAnswer.playerProgress = playerProgress;
      wrongAnswer.gameQuestion = gameQuestion;
      wrongAnswer.answerStatus = AnswerStatus.Incorrect;
      wrongAnswer.addedAt = new Date();
      return wrongAnswer;
    });

    // Сохраняем все неправильные ответы (можно заменить на batch-сохранение, если репозиторий поддерживает)
    for (const answer of wrongAnswers) {
      await this.answerRepository.saveAnswer(answer);
    }

    if (!playerProgress.answers) playerProgress.answers = [];
    playerProgress.answers.push(...wrongAnswers);

    await this.playerProgressRepository.savePlayerProgress(playerProgress);
  }
}
