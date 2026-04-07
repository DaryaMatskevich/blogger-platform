import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../modules/user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../modules/user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../modules/user-accounts/guards/dto/user-contex.dto';
import { UsersTopQueryParamsDto } from '../../../modules/pairGameQuiz/api/dto/users.top/users-top-query-params.dto';
import { GetUsersTopQuery } from '../../../modules/pairGameQuiz/application/queries/get-users-top.query-handler';
import { UsersTopViewDto } from '../../../modules/pairGameQuiz/api/dto/users.top/users-top-view-dto';
import { GetMyStatisticQuery } from '../../../modules/pairGameQuiz/application/queries/get-my-statistic.query-handler';
import { MyStatisticViewDto } from '../../../modules/pairGameQuiz/api/dto/statistic/my-statistic-view.dto';

@Controller('pair-game-quiz/users')
export class UsersStatisticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('top')
  async getUsersTop(
    @Query() queryParams: UsersTopQueryParamsDto,
  ): Promise<UsersTopViewDto> {
    return this.queryBus.execute(new GetUsersTopQuery(queryParams));
  }

  @Get('my-statistic')
  @UseGuards(JwtAuthGuard)
  async getMyStatistic(
    @ExtractUserFromRequest() userContext: UserContextDto,
  ): Promise<MyStatisticViewDto> {
    return this.queryBus.execute(new GetMyStatisticQuery(userContext.id));
  }
}
