import { Injectable } from '@nestjs/common';
import { GameRepository } from '../../infrastructure/game.repository';
import { AnswerRepository } from '../../infrastructure/answers.repository';
import { PlayerProgressRepository } from '../../infrastructure/player-progress.repository';
import { UsersStatisticsRepository } from '../../infrastructure/users-statistics.repository';
import { GameStatus } from '../../domain/game.entity';
import { AnswerStatus, PlayerAnswer } from '../../domain/player-answer.entity';

@Injectable()
export class FinishGameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly playerProgressRepository: PlayerProgressRepository,
    private readonly usersStatisticsRepository: UsersStatisticsRepository,
  ) {}

  async finishGame(game: any, totalQuestions: number): Promise<void> {
    if (game.status !== GameStatus.Active) return;

    const firstProgress = game.firstPlayerProgress;
    const secondProgress = game.secondPlayerProgress;

    const isFirstFinished = firstProgress.answers.length === totalQuestions;
    const isSecondFinished = secondProgress.answers.length === totalQuestions;

    // Добавляем неправильные ответы для тех, кто не закончил
    if (!isFirstFinished) {
      await this.addMissingAnswers(firstProgress, game.questions);
    }
    if (!isSecondFinished) {
      await this.addMissingAnswers(secondProgress, game.questions);
    }

    // Бонус за скорость, если оба закончили
    if (isFirstFinished && isSecondFinished) {
      const firstLastTime = this.getLastAnswerTime(firstProgress);
      const secondLastTime = this.getLastAnswerTime(secondProgress);
      if (firstLastTime && secondLastTime) {
        if (firstLastTime < secondLastTime && firstProgress.score > 0) {
          firstProgress.score += 1;
          await this.playerProgressRepository.savePlayerProgress(firstProgress);
        } else if (secondLastTime < firstLastTime && secondProgress.score > 0) {
          secondProgress.score += 1;
          await this.playerProgressRepository.savePlayerProgress(
            secondProgress,
          );
        }
      }
    }

    // Определяем результаты для статистики
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

    game.status = GameStatus.Finished;
    game.finishGameDate = new Date();
    await this.gameRepository.saveGame(game);
  }

  private async addMissingAnswers(
    playerProgress: any,
    gameQuestions: any[],
  ): Promise<void> {
    const answeredIds = new Set(
      playerProgress.answers.map((a) => a.gameQuestion.id),
    );
    const missingGameQuestions = gameQuestions.filter(
      (q) => !answeredIds.has(q.id),
    );

    for (const gameQuestion of missingGameQuestions) {
      const wrongAnswer = new PlayerAnswer();
      wrongAnswer.playerProgress = playerProgress;
      wrongAnswer.gameQuestion = gameQuestion;
      wrongAnswer.answerStatus = AnswerStatus.Incorrect;
      wrongAnswer.addedAt = new Date();
      await this.answerRepository.saveAnswer(wrongAnswer);
      playerProgress.answers.push(wrongAnswer);
    }
    await this.playerProgressRepository.savePlayerProgress(playerProgress);
  }

  private getLastAnswerTime(progress: any): Date | null {
    if (!progress.answers.length) return null;
    return progress.answers.reduce(
      (latest, a) => (a.addedAt > latest.addedAt ? a : latest),
      progress.answers[0],
    ).addedAt;
  }
}
