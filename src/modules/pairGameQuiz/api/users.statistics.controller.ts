import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MyGamesViewDto } from './dto/game-view.dto';
import { JwtAuthGuard } from '../../../modules/user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../modules/user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../modules/user-accounts/guards/dto/user-contex.dto';
import { UsersTopQueryParamsDto } from '../../../modules/pairGameQuiz/api/dto/users.top/users-top-query-params.dto';
import { GetUsersTopQuery } from '../../../modules/pairGameQuiz/application/queries/get-users-top.query-handler';
import { UsersTopViewDto } from '../../../modules/pairGameQuiz/api/dto/users.top/users-top-view-dto';
import { MyGamesQueryParamsDto } from '../../../modules/pairGameQuiz/api/dto/my-games-query-params.dto';
import { GetMyGamesQuery } from '../../../modules/pairGameQuiz/application/queries/get-my-games.query-handler';

@Controller('pair-game-quiz/users')
export class GameController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('top')
  async getUsersTop(
    @Query() queryParams: UsersTopQueryParamsDto,
  ): Promise<UsersTopViewDto> {
    return this.queryBus.execute(new GetUsersTopQuery(queryParams));
  }

  @Get('my-statistic')
  @UseGuards(JwtAuthGuard)
  async getMyGames(
    @ExtractUserFromRequest() userContext: UserContextDto,
    @Query() queryParams: MyGamesQueryParamsDto,
  ): Promise<MyGamesViewDto> {
    return this.queryBus.execute(
      new GetMyGamesQuery(userContext.id, queryParams),
    );
  }
}
