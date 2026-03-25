import { PairGameRepository } from '../../../../modules/pairGameQuiz/infrastructure/pair-game.repository';
import { GameViewDto } from '../../../../modules/pairGameQuiz/api/dto/game-view.dto';
import { Game } from '../../../../modules/pairGameQuiz/domain/game.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PlayerProgress } from '../../../../modules/pairGameQuiz/domain/player-progress.entity';

@Injectable()
export class ConnectToGameUseCase {
  constructor(private readonly pairGameRepository: PairGameRepository) {}

  async execute(userId: number): Promise<GameViewDto> {
    // Проверка на уже активное участие
    const existingActiveGame =
      await this.pairGameRepository.findActiveGameByUserId(userId);
    if (existingActiveGame) {
      throw new ForbiddenException(
        'User is already participating in an active pair',
      );
    }

    let game: Game;

    const pendingGame = await this.pairGameRepository.findPendingGame();

    if (pendingGame) {
      // Подключаем второго игрока
      const secondProgress =
        await this.pairGameRepository.createPlayerProgress(userId);
      game = await this.pairGameRepository.addSecondPlayerAndStart(
        pendingGame,
        secondProgress,
      );

      const questions = await this.pairGameRepository.getRandomQuestions(5);
      await this.pairGameRepository.createGameQuestions(game, questions);
    } else {
      // Создаём новую игру с первым игроком
      const firstProgress =
        await this.pairGameRepository.createPlayerProgress(userId);
      game = await this.pairGameRepository.createGame(firstProgress);
    }

    const loadedGame = await this.pairGameRepository.findGameWithRelations(
      game.id,
    );
    if (!loadedGame) {
      throw new Error('Game not found after creation');
    }

    return this.mapToViewModel(loadedGame);
  }

  private mapToViewModel(game: Game): GameViewDto {
    return {
      id: game.id.toString(),
      firstPlayerProgress: this.mapPlayerProgress(game.firstPlayerProgress),
      secondPlayerProgress: game.secondPlayerProgress
        ? this.mapPlayerProgress(game.secondPlayerProgress)
        : null,
      questions: game.questions.map((gq) => ({
        id: gq.question.id.toString(),
        body: gq.question.body,
      })),
      status: game.status,
      pairCreatedDate: game.createdAt.toISOString(),
      startGameDate: game.startGameDate?.toISOString() || null,
      finishGameDate: game.finishGameDate?.toISOString() || null,
    };
  }

  private mapPlayerProgress(progress: PlayerProgress) {
    return {
      answers:
        progress.answers?.map((a) => ({
          questionId: a.question.id.toString(),
          answerStatus: a.answerStatus,
          addedAt: a.addedAt.toISOString(),
        })) || [],
      player: {
        id: progress.playerAccount.id.toString(),
        login: progress.playerAccount.login,
      },
      score: progress.score,
    };
  }
}
