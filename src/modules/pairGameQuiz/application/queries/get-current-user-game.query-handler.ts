// get-current-user-game.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GameViewDto } from '../../api/dto/game-view.dto';
import { GameQueryRepository } from '../../infrastructure/query/game-query.repository';

export class GetCurrentUserGameQuery {
  constructor(public readonly userId: string) {}
}

@Injectable()
@QueryHandler(GetCurrentUserGameQuery)
export class GetCurrentUserGameHandler
  implements IQueryHandler<GetCurrentUserGameQuery, GameViewDto>
{
  constructor(private readonly gameQueryRepository: GameQueryRepository) {}

  async execute(query: GetCurrentUserGameQuery): Promise<GameViewDto> {
    const { userId } = query;
    const userIdNumber = parseInt(userId, 10);
    const unfinishedGameResult =
      await this.gameQueryRepository.findUnfinishedGameByUserId(userIdNumber);

    const unfinishedGame = Array.isArray(unfinishedGameResult)
      ? (unfinishedGameResult[0] ?? null)
      : unfinishedGameResult;

    if (!unfinishedGame) {
      throw new NotFoundException('Active game not found');
    }
    const game = await this.gameQueryRepository.findGameById(unfinishedGame.id);
    if (!game) {
      throw new NotFoundException('Active game not found');
    }
    return game;
  }
}
