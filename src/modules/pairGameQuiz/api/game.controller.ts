import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GameViewDto } from './dto/game-view.dto';
import { JwtAuthGuard } from '../../../modules/user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../modules/user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { ConnectToGameCommand } from '../../../modules/pairGameQuiz/application/usecases/connect-to-game.usecase';
import { UserContextDto } from '../../../modules/user-accounts/guards/dto/user-contex.dto';
import { GameQueryRepository } from '../../../modules/pairGameQuiz/infrastructure/query/game-query.repository';
import { GetGameByIdQuery } from '../../../modules/pairGameQuiz/application/queries/get-game-by-id.query-handler';
import { GetCurrentUserGameQuery } from '../../../modules/pairGameQuiz/application/queries/get-current-user-game.query-handler';
import { AnswerDto } from '../../../modules/pairGameQuiz/api/dto/answer.dto';
import { AnswerResponseDto } from '../../../modules/pairGameQuiz/api/dto/answer-response.dto';
import { SendAnswerCommand } from '../../../modules/pairGameQuiz/application/usecases/send-answer.usecase';
import { UsersTopQueryParamsDto } from '../../../modules/pairGameQuiz/api/dto/users.top/users-top-query-params.dto';
import { GetUsersTopQuery } from '../../../modules/pairGameQuiz/application/queries/get-users-top.query-handler';
import { UsersTopViewDto } from '../../../modules/pairGameQuiz/api/dto/users.top/users-top-view-dto';

@Controller('pair-game-quiz/pairs')
export class GameController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private gameQueryRepository: GameQueryRepository,
  ) {}

  @Post('connection')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async connectToGame(
    @ExtractUserFromRequest() userContext: UserContextDto,
  ): Promise<GameViewDto> {
    const gameId: number = await this.commandBus.execute(
      new ConnectToGameCommand(userContext.id),
    );
    const game = await this.gameQueryRepository.findGameById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  @Get('my-current')
  @UseGuards(JwtAuthGuard)
  async getMyCurrentGame(
    @ExtractUserFromRequest() userContext: UserContextDto,
  ): Promise<GameViewDto> {
    return this.queryBus.execute(new GetCurrentUserGameQuery(userContext.id));
  }

  @Post('my-current/answers')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async sendAnswer(
    @Body() answerDto: AnswerDto,
    @ExtractUserFromRequest() userContext: UserContextDto,
  ): Promise<AnswerResponseDto> {
    return this.commandBus.execute(
      new SendAnswerCommand(userContext.id, answerDto.answer),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getGameById(
    @Param('id', ParseIntPipe) id: number,
    @ExtractUserFromRequest() userContext: UserContextDto,
  ): Promise<GameViewDto> {
    return this.queryBus.execute(new GetGameByIdQuery(id, userContext.id));
  }

  @Get('top')
  async getUsersTop(
    @Query() queryParams: UsersTopQueryParamsDto,
  ): Promise<UsersTopViewDto> {
    return this.queryBus.execute(new GetUsersTopQuery(queryParams));
  }
}
