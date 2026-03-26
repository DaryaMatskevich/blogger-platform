import { Module } from '@nestjs/common';
import { UserAccountsModule } from '../user-accounts/userAccounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../../modules/pairGameQuiz/domain/answer.entity';
import { Game } from '../../modules/pairGameQuiz/domain/game.entity';
import { GameQuestion } from '../../modules/pairGameQuiz/domain/game-question.entity';
import { PlayerAnswer } from '../../modules/pairGameQuiz/domain/player-answer.entity';
import { PlayerProgress } from '../../modules/pairGameQuiz/domain/player-progress.entity';
import { GameController } from '../../modules/pairGameQuiz/api/game.controller';
import { ConnectToGameUseCase } from '../../modules/pairGameQuiz/application/usecases/connect-to-game.usecase';
import { GameRepository } from '../../modules/pairGameQuiz/infrastructure/game.repository';
import { GameQuestionsRepository } from '../../modules/pairGameQuiz/infrastructure/game-questions.repository';
import { GameQueryRepository } from '../../modules/pairGameQuiz/infrastructure/query/game-query.repository';
import { PlayerProgressRepository } from '../../modules/pairGameQuiz/infrastructure/player-progress.repository';
import { AnswerRepository } from '../../modules/pairGameQuiz/infrastructure/answers.repository';
import { SaModule } from '../../modules/sa/sa.module';
import { GetGameByIdHandler } from '../../modules/pairGameQuiz/application/queries/get-game-by-id.query-handler';
import {
  GetCurrentUserGameQuery
} from '../../modules/pairGameQuiz/application/queries/get-current-user-game.query-handler';

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
    SaModule,
    TypeOrmModule.forFeature([
      Answer,
      Game,
      GameQuestion,
      PlayerAnswer,
      PlayerProgress,
    ]),
  ],
  controllers: [GameController],
  providers: [
    ConnectToGameUseCase,
    GameRepository,
    GameQuestionsRepository,
    GameQueryRepository,
    PlayerProgressRepository,
    AnswerRepository,
    GetGameByIdHandler,
    GetCurrentUserGameQuery,
  ],
  exports: [],
})
export class GameQuizModule {}
