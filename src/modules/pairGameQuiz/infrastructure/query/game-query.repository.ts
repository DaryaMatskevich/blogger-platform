import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GameViewDto, UserGamesViewDto } from '../../api/dto/game-view.dto';
import {
  Game,
  GameStatus,
} from '../../../../modules/pairGameQuiz/domain/game.entity';
import { PlayerProgress } from '../../../../modules/pairGameQuiz/domain/player-progress.entity';

interface GetUserGamesParams {
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

  async findActiveGamesWithOneFinishedTimeout(
    timeoutSeconds: number,
  ): Promise<Game[]> {
    const now = new Date();
    const timeoutDate = new Date(now.getTime() - timeoutSeconds * 1000);

    return this.dataSource
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'question')
      .where('game.status = :status', { status: GameStatus.Active })
      .andWhere(
        `(game.firstPlayerFinishedAt IS NOT NULL AND game.secondPlayerFinishedAt IS NULL 
          AND game.firstPlayerFinishedAt <= :timeoutDate)
         OR
         (game.firstPlayerFinishedAt IS NULL AND game.secondPlayerFinishedAt IS NOT NULL 
          AND game.secondPlayerFinishedAt <= :timeoutDate)`,
        { timeoutDate },
      )
      .getMany();
  }

  async findGameEntityById(id: number): Promise<Game | null> {
    return this.dataSource
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('firstProgress.answers', 'firstAnswers')
      .leftJoinAndSelect('firstAnswers.gameQuestion', 'firstGameQuestion')
      .leftJoinAndSelect('firstGameQuestion.question', 'firstQuestion')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.gameQuestion', 'secondGameQuestion')
      .leftJoinAndSelect('secondGameQuestion.question', 'secondQuestion')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'question')
      .where('game.id = :id', { id })
      .getOne();
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
    params: GetUserGamesParams,
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
      .leftJoinAndSelect(
        'firstAnswerQuestion.question',
        'firstAnswerQuestionQuestion',
      )
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.gameQuestion', 'secondAnswerQuestion')
      .leftJoinAndSelect(
        'secondAnswerQuestion.question',
        'secondAnswerQuestionQuestion',
      )
      .where(
        'firstProgress.player.id = :userId OR secondProgress.player.id = :userId',
        { userId },
      );

    // ✅ Исправленная сортировка
    const orderBy: Record<string, 'ASC' | 'DESC'> = {};
    const allowedSortFields = [
      'pairCreatedDate',
      'startGameDate',
      'finishGameDate',
      'status',
    ];

    if (allowedSortFields.includes(sortBy)) {
      orderBy[`game.${sortBy}`] = sortDirection.toUpperCase() as 'ASC' | 'DESC';
    } else {
      orderBy['game.pairCreatedDate'] = 'DESC';
    }
    // Всегда сортируем по дате создания внутри группы
    orderBy['game.pairCreatedDate'] = 'DESC';

    qb.orderBy(orderBy);
    qb.skip(skip).take(take);

    const [items, totalCount] = await qb.getManyAndCount();
    return { items, totalCount };
  }

  // Новый метод – возвращает готовый DTO для ответа
  async getMyGamesView(
    userId: number,
    params: {
      sortBy: string;
      sortDirection: 'asc' | 'desc';
      pageNumber: number;
      pageSize: number;
    },
  ): Promise<UserGamesViewDto> {
    const { sortBy, sortDirection, pageNumber, pageSize } = params;
    const skip = (pageNumber - 1) * pageSize;

    const { items: rawItems, totalCount } = await this.getMyGames({
      userId,
      sortBy,
      sortDirection,
      skip,
      take: pageSize,
    });

    const items = rawItems.map((game) => this.mapToGameViewDto(game));
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }
  // infrastructure/query/game-query.repository.ts
  async findExpiredActiveGames(timeoutMs: number): Promise<Game[]> {
    const timeoutDate = new Date(Date.now() - timeoutMs);
    return this.dataSource
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('firstProgress.answers', 'firstAnswers')
      .leftJoinAndSelect('firstAnswers.gameQuestion', 'firstGameQuestion')
      .leftJoinAndSelect('firstGameQuestion.question', 'firstQuestion')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.gameQuestion', 'secondGameQuestion')
      .leftJoinAndSelect('secondGameQuestion.question', 'secondQuestion')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'question')
      .where('game.status = :status', { status: GameStatus.Active })
      .andWhere(
        '(game.firstPlayerFinishedAt IS NOT NULL AND game.secondPlayerFinishedAt IS NULL AND game.firstPlayerFinishedAt <= :timeout) OR ' +
          '(game.secondPlayerFinishedAt IS NOT NULL AND game.firstPlayerFinishedAt IS NULL AND game.secondPlayerFinishedAt <= :timeout)',
        { timeout: timeoutDate },
      )
      .getMany();
  }
  private mapToGameViewDto(game: Game): GameViewDto {
    // Безопасное получение answers с проверкой на undefined
    const getAnswersArray = (progress: PlayerProgress | null | undefined) => {
      if (!progress?.answers) return [];
      return [...progress.answers].sort(
        (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
      );
    };

    const firstAnswers = getAnswersArray(game.firstPlayerProgress);
    const secondAnswers = getAnswersArray(game.secondPlayerProgress);

    const firstPlayerProgress = game.firstPlayerProgress
      ? {
          answers: firstAnswers.map((answer) => ({
            // ✅ безопасный доступ через optional chaining
            questionId:
              answer.gameQuestion?.question?.id?.toString() ?? 'unknown',
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

    const secondPlayerProgress = game.secondPlayerProgress
      ? {
          answers: secondAnswers.map((answer) => ({
            questionId:
              answer.gameQuestion?.question?.id?.toString() ?? 'unknown',
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

    // Безопасная обработка вопросов игры
    const questions =
      game.status !== GameStatus.PendingSecondPlayer
        ? (game.questions || [])
            .sort((a, b) => a.order - b.order)
            .map((gameQuestion) => ({
              id: gameQuestion.question.id.toString(),
              body: gameQuestion.question.body,
            }))
        : null;

    // 🔧 Исправление имени поля: если в сущности поле createdAt, используем его
    // Предположим, что в Game есть поле createdAt (или pairCreatedDate)
    const pairCreatedDate =
      (game as any).pairCreatedDate ?? (game as any).createdAt;
    if (!pairCreatedDate) {
      // fallback на текущую дату (логируем ошибку)
      console.error(`Game ${game.id} has no creation date`);
    }

    return {
      id: game.id.toString(),
      firstPlayerProgress,
      secondPlayerProgress,
      questions,
      status: game.status,
      pairCreatedDate:
        pairCreatedDate?.toISOString() ?? new Date().toISOString(),
      startGameDate: game.startGameDate?.toISOString() ?? null,
      finishGameDate: game.finishGameDate?.toISOString() ?? null,
    };
  }
}
