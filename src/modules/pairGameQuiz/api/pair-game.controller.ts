import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { GameViewDto } from './dto/game-view.dto';
import { AnswerDto } from './dto/answer.dto';
import { AnswerResponseDto } from './dto/answer-response.dto';
import { GetCurrentUserGameQuery } from './queries/get-current-user-game.query';
import { GetGameByIdQuery } from './queries/get-game-by-id.query';
import { ConnectToGameCommand } from './commands/connect-to-game.command';
import { SendAnswerCommand } from './commands/send-answer.command';
import { JwtAuthGuard } from '../../../modules/user-accounts/guards/bearer/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pairs')
export class PairGameController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('my-current')
  async getMyCurrentGame(
    @CurrentUserId() userId: string,
  ): Promise<GameViewDto> {
    return this.queryBus.execute(new GetCurrentUserGameQuery(userId));
  }

  @Get(':id')
  async getGameById(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
  ): Promise<GameViewDto> {
    return this.queryBus.execute(new GetGameByIdQuery(id, userId));
  }

  @Post('connection')
  async connectToGame(@CurrentUserId() userId: string): Promise<GameViewDto> {
    return this.commandBus.execute(new ConnectToGameCommand(userId));
  }

  @Post('my-current/answers')
  async sendAnswer(
    @Body() answerDto: AnswerDto,
    @CurrentUserId() userId: string,
  ): Promise<AnswerResponseDto> {
    return this.commandBus.execute(new SendAnswerCommand(userId, answerDto));
  }
}
