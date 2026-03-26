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
    const game =
      await this.gameQueryRepository.findActiveGameByUserId(userIdNumber);
    if (!game) {
      throw new NotFoundException('Active game not found');
    }
    return game;
  }
}
