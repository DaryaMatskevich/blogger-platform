import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
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

@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz/pairs')
export class GameController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private gameQueryRepository: GameQueryRepository,
  ) {}

  @Get('my-current')
  async getMyCurrentGame(
    @ExtractUserFromRequest() userContext: UserContextDto,
  ): Promise<GameViewDto> {
    return this.queryBus.execute(new GetCurrentUserGameQuery(userContext.id));
  }

  @Get(':id')
  async getGameById(
    @Param('id') id: string,
    @ExtractUserFromRequest() userContext: UserContextDto,
  ): Promise<GameViewDto> {
    return this.queryBus.execute(new GetGameByIdQuery(id, userContext.id));
  }

  @Post('connection')
  async connectToGame(
    @ExtractUserFromRequest() userContext: UserContextDto,
  ): Promise<GameViewDto> {
    const gameId = await this.commandBus.execute(
      new ConnectToGameCommand(userContext.id),
    );
    const game = await this.gameQueryRepository.findGameById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  // @Post('my-current/answers')
  // async sendAnswer(
  //   @Body() answerDto: AnswerDto,
  //   @ExtractUserFromRequest() userContext: UserContextDto,
  // ): Promise<AnswerResponseDto> {
  //   return this.commandBus.execute(
  //     new SendAnswerCommand(userContext.id, answerDto),
  //   );
  // }
}
