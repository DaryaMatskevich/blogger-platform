import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GameViewDto } from '../../api/dto/game-view.dto';
import {
  Game,
  GameStatus,
} from '../../../../modules/pairGameQuiz/domain/game.entity';
import { UsersTopViewDto } from '../../../../modules/pairGameQuiz/api/dto/users.top/users-top-view-dto';

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
  async getUsersTop({ sort, page, pageSize }): Promise<UsersTopViewDto> {
    // Агрегация статистики по игрокам
    // Предполагаем, что в таблице game есть поля: firstPlayerId, secondPlayerId, winnerId, firstPlayerScore, secondPlayerScore, status
    // И таблица user с id, login

    // Строим запрос с JOIN на user, считаем sumScore, avgScores, gamesCount, winsCount, lossesCount, drawsCount
    // Это сложный запрос, приведу упрощённый вариант с QueryBuilder

    const qb = this.dataSource.createQueryBuilder(Game, 'g');

    // Получаем статистику для каждого пользователя, который участвовал хотя бы в одной игре
    const stats = await qb
      .select([
        'u.id as id',
        'u.login as login',
        'SUM(CASE WHEN g.firstPlayerId = u.id THEN g.firstPlayerScore ELSE g.secondPlayerScore END) as sumScore',
        'AVG(CASE WHEN g.firstPlayerId = u.id THEN g.firstPlayerScore ELSE g.secondPlayerScore END) as avgScores',
        'COUNT(*) as gamesCount',
        'SUM(CASE WHEN g.winnerId = u.id THEN 1 ELSE 0 END) as winsCount',
        "SUM(CASE WHEN g.status = 'finished' AND g.winnerId IS NOT NULL AND g.winnerId != u.id THEN 1 ELSE 0 END) as lossesCount",
        "SUM(CASE WHEN g.status = 'finished' AND g.winnerId IS NULL THEN 1 ELSE 0 END) as drawsCount",
      ])
      .innerJoin('g.firstPlayer', 'u1')
      .innerJoin('g.secondPlayer', 'u2')
      .innerJoin('user', 'u', 'u.id = u1.id OR u.id = u2.id')
      .where("g.status = 'finished'")
      .groupBy('u.id, u.login')
      .getRawMany();

    // Применяем сортировку (например, сначала по avgScores, потом по sumScore)
    const items = stats.map((row) => ({
      sumScore: Number(row.sumScore) || 0,
      avgScores: Number(row.avgScores) || 0,
      gamesCount: Number(row.gamesCount),
      winsCount: Number(row.winsCount),
      lossesCount: Number(row.lossesCount),
      drawsCount: Number(row.drawsCount),
      player: { id: row.id, login: row.login },
    }));

    for (const sortRule of sort) {
      const { field, order } = sortRule;
      items.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (order === 'ASC') return aVal > bVal ? 1 : -1;
        else return aVal < bVal ? 1 : -1;
      });
    }

    const totalCount = items.length;
    const start = (page - 1) * pageSize;
    const paginatedItems = items.slice(start, start + pageSize);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
      totalCount,
      items: paginatedItems,
    };
  }
}
