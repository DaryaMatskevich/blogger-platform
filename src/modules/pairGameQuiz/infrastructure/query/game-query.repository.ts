import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GameViewDto } from '../../api/dto/game-view.dto';
import {
  Game,
  GameStatus,
} from '../../../../modules/pairGameQuiz/domain/game.entity';

export interface GetMyGamesParams {
  userId: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  skip: number;
  take: number;
}
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

  async findGameById(id: number): Promise<GameViewDto | null> {
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
    gameId: number,
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

  async getMyGames(
    params: GetMyGamesParams,
  ): Promise<{ items: Game[]; totalCount: number }> {
    const { userId, sortBy, sortDirection, skip, take } = params;

    const qb = this.dataSource
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('firstProgress.player', 'firstPlayer')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('secondProgress.player', 'secondPlayer')
      .leftJoinAndSelect('game.questions', 'gameQuestion')
      .leftJoinAndSelect('gameQuestion.question', 'question')
      .leftJoinAndSelect('firstProgress.answers', 'firstAnswers')
      .leftJoinAndSelect('firstAnswers.gameQuestion', 'firstAnswerQuestion')
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.gameQuestion', 'secondAnswerQuestion')
      .where(
        'firstProgress.player.id = :userId OR secondProgress.player.id = :userId',
        { userId },
      );

    // Сортировка
    const allowedSortFields = [
      'pairCreatedDate',
      'startGameDate',
      'finishGameDate',
    ];
    if (allowedSortFields.includes(sortBy)) {
      qb.orderBy(
        `game.${sortBy}`,
        sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      qb.orderBy('game.pairCreatedDate', 'DESC');
    }

    // Пагинация
    qb.skip(skip).take(take);

    const [items, totalCount] = await qb.getManyAndCount();

    return { items, totalCount };
  }

  private mapToGameViewDto(game: Game): GameViewDto {
    // Формируем объект для первого игрока
    const firstPlayerProgress = game.firstPlayerProgress
      ? {
          answers: game.firstPlayerProgress.answers
            .sort(
              (a, b) =>
                new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
            )
            .map((answer) => ({
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
          answers: game.secondPlayerProgress.answers
            .sort(
              (a, b) =>
                new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
            )
            .map((answer) => ({
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
      game.status !== GameStatus.PendingSecondPlayer
        ? game.questions
            .sort((a, b) => a.order - b.order)
            .map((gameQuestion) => ({
              id: gameQuestion.question.id.toString(),
              body: gameQuestion.question.body,
            }))
        : null;

    return {
      id: game.id.toString(),
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
