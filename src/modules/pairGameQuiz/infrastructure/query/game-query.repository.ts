import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GameViewDto } from '../../api/dto/game-view.dto';
import {
  Game,
  GameStatus,
} from '../../../../modules/pairGameQuiz/domain/game.entity';

@Injectable()
export class GameQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findPendingGame(): Promise<Game | null> {
    return this.dataSource
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .where('game.status = :status', {
        status: GameStatus.PendingSecondPlayer,
      })
      .getOne();
  }

  async findGameById(id: string): Promise<GameViewDto | null> {
    const game = await this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('firstProgress.player', 'firstPlayer')
      .leftJoinAndSelect('firstProgress.answers', 'firstAnswers')
      .leftJoinAndSelect('firstAnswers.gameQuestion', 'firstGameQuestion')
      .leftJoinAndSelect('firstGameQuestion.question', 'firstQuestion')
      .leftJoinAndSelect('g.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('secondProgress.player', 'secondPlayer')
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.gameQuestion', 'secondGameQuestion')
      .leftJoinAndSelect('secondGameQuestion.question', 'secondQuestion')
      .leftJoinAndSelect('g.questions', 'gameQuestions')
      .leftJoinAndSelect('gameQuestions.question', 'question')
      .where('g.id = :id', { id })
      .getOne();

    if (!game) return null;

    return this.mapToGameViewDto(game);
  }

  async findGameByIdAndUserId(
    gameId: string,
    userId: number,
  ): Promise<GameViewDto | null> {
    const game = await this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('firstProgress.player', 'firstPlayer')
      .leftJoinAndSelect('firstProgress.answers', 'firstAnswers')
      .leftJoinAndSelect('firstAnswers.gameQuestion', 'firstGameQuestion')
      .leftJoinAndSelect('firstGameQuestion.question', 'firstQuestion')
      .leftJoinAndSelect('g.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('secondProgress.player', 'secondPlayer')
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.gameQuestion', 'secondGameQuestion')
      .leftJoinAndSelect('secondGameQuestion.question', 'secondQuestion')
      .leftJoinAndSelect('g.questions', 'gameQuestions')
      .leftJoinAndSelect('gameQuestions.question', 'question')
      .where('g.id = :gameId', { gameId })
      .andWhere('(firstPlayer.id = :userId OR secondPlayer.id = :userId)', {
        userId,
      })
      .getOne();

    if (!game) return null;
    return this.mapToGameViewDto(game);
  }

  async findActiveGameByUserId(userId: number): Promise<Game | null> {
    const game = await this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('firstProgress.player', 'firstPlayer')
      .leftJoinAndSelect('firstProgress.answers', 'firstAnswers')
      .leftJoinAndSelect('firstAnswers.gameQuestion', 'firstGameQuestion')
      .leftJoinAndSelect('firstGameQuestion.question', 'firstQuestion')
      .leftJoinAndSelect('g.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('secondProgress.player', 'secondPlayer')
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.gameQuestion', 'secondGameQuestion')
      .leftJoinAndSelect('secondGameQuestion.question', 'secondQuestion')
      .leftJoinAndSelect('g.questions', 'gameQuestions')
      .leftJoinAndSelect('gameQuestions.question', 'question')
      .where('g.status = :status', {
        status: GameStatus.Active,
      })
      .andWhere('(firstPlayer.id = :userId OR secondPlayer.id = :userId)', {
        userId,
      })
      .getOne();
    return game;
  }

  async findUnfinishedGameByUserId(userId: number): Promise<Game | null> {
    return this.dataSource
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .where(
        '(firstProgress.playerAccountId = :userId OR secondProgress.playerAccountId = :userId) AND game.status IN (:...statuses)',
        {
          userId,
          statuses: [GameStatus.PendingSecondPlayer, GameStatus.Active],
        },
      )
      .getOne();
  }

  private mapToGameViewDto(game: Game): GameViewDto {
    // Формируем объект для первого игрока
    const firstPlayerProgress = game.firstPlayerProgress
      ? {
          answers: game.firstPlayerProgress.answers.map((answer) => ({
            questionId: answer.gameQuestion.question.id.toString(),
            answerStatus: answer.answerStatus,
            addedAt: answer.addedAt.toISOString(),
          })),
          player: {
            id: game.firstPlayerProgress.player.id.toString(),
            login: game.firstPlayerProgress.player.login,
          },
          score: game.firstPlayerProgress.score,
        }
      : null;

    // Формируем объект для второго игрока
    const secondPlayerProgress = game.secondPlayerProgress
      ? {
          answers: game.secondPlayerProgress.answers.map((answer) => ({
            questionId: answer.gameQuestion.question.id.toString(),
            answerStatus: answer.answerStatus,
            addedAt: answer.addedAt.toISOString(),
          })),
          player: {
            id: game.secondPlayerProgress.player.id.toString(),
            login: game.secondPlayerProgress.player.login,
          },
          score: game.secondPlayerProgress.score,
        }
      : null;

    const questions =
      game.status === GameStatus.Active
        ? game.questions
            .sort((a, b) => a.order - b.order)
            .map((gameQuestion) => ({
              id: gameQuestion.question.id.toString(),
              body: gameQuestion.question.body,
            }))
        : null;

    return {
      id: game.id,
      firstPlayerProgress,
      secondPlayerProgress,
      questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate.toISOString(), // обратите внимание на название поля
      startGameDate: game.startGameDate?.toISOString() || null,
      finishGameDate: game.finishGameDate?.toISOString() || null,
    };
  }
}
