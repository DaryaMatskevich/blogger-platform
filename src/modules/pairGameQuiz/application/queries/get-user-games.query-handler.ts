import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/query/game-query.repository';
import { GameViewDto, MyGamesViewDto } from '../../api/dto/game-view.dto';
import { Injectable } from '@nestjs/common';
import { UserGamesQueryParamsDto } from '../../api/dto/user-games-query-params.dto';

export class GetUserGamesQuery {
  constructor(
    public readonly userId: string,
    public readonly params: UserGamesQueryParamsDto,
  ) {}
}

@Injectable()
@QueryHandler(GetUserGamesQuery)
export class GetUserGamesQueryHandler
  implements IQueryHandler<GetUserGamesQuery, MyGamesViewDto>
{
  constructor(private readonly gameQueryRepository: GameQueryRepository) {}

  async execute(query: GetUserGamesQuery): Promise<MyGamesViewDto> {
    const { userId, params } = query;
    const userIdNum = parseInt(userId, 10);

    const { sortBy, sortDirection, pageNumber, pageSize } = params;
    const skip = (pageNumber - 1) * pageSize;

    const { items: rawItems, totalCount } =
      await this.gameQueryRepository.getMyGames({
        userId: userIdNum,
        sortBy,
        sortDirection,
        skip,
        take: pageSize,
      });

    // Преобразование сырых данных в DTO (если репозиторий возвращает сущности)
    const items: GameViewDto[] = rawItems.map((game) => ({
      id: game.id.toString(),
      firstPlayerProgress: game.firstPlayerProgress
        ? {
            answers:
              game.firstPlayerProgress.answers?.map((a) => ({
                questionId: a.gameQuestion.question.id.toString(),
                answerStatus: a.answerStatus,
                addedAt: a.addedAt.toISOString(),
              })) ?? [],
            player: {
              id: game.firstPlayerProgress.player.id.toString(),
              login: game.firstPlayerProgress.player.login,
            },
            score: game.firstPlayerProgress.score,
          }
        : null,
      secondPlayerProgress: game.secondPlayerProgress
        ? {
            answers:
              game.secondPlayerProgress.answers?.map((a) => ({
                questionId: a.gameQuestion.question.id.toString(),
                answerStatus: a.answerStatus,
                addedAt: a.addedAt.toISOString(),
              })) ?? [],
            player: {
              id: game.secondPlayerProgress.player.id.toString(),
              login: game.secondPlayerProgress.player.login,
            },
            score: game.secondPlayerProgress.score,
          }
        : null,
      questions:
        game.questions?.map((gq) => ({
          id: gq.question.id.toString(),
          body: gq.question.body,
        })) ?? [],
      status: game.status,
      pairCreatedDate: game.pairCreatedDate.toISOString(),
      startGameDate: game.startGameDate?.toISOString() ?? null,
      finishGameDate: game.finishGameDate?.toISOString() ?? null,
    }));

    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }
}
