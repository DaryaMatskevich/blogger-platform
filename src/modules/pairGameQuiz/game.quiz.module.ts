import { Module } from '@nestjs/common';
import { UserAccountsModule } from '../user-accounts/userAccounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { GetCurrentUserGameHandler } from '../../modules/pairGameQuiz/application/queries/get-current-user-game.query-handler';
import { SendAnswerUseCase } from '../../modules/pairGameQuiz/application/usecases/send-answer.usecase';
import { CoreModule } from '../../core/core.module';
import { GetUsersTopQueryHandler } from '../../modules/pairGameQuiz/application/queries/get-users-top.query-handler';
import { UsersStatisticsRepository } from '../../modules/pairGameQuiz/infrastructure/users-statistics.repository';
import { GetMyGamesQueryHandler } from './application/queries/get-user-games.query-handler';
import { UsersStatisticsQueryRepository } from '../../modules/pairGameQuiz/infrastructure/query/users-statistics.query.repository';
import { UserStatistic } from './domain/user-statistic.entity';
import { UsersStatisticsController } from './api/users.statistics.controller';
import { GetMyStatisticQueryHandler } from '../../modules/pairGameQuiz/application/queries/get-my-statistic.query-handler';

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
    SaModule,
    TypeOrmModule.forFeature([
      Game,
      GameQuestion,
      PlayerAnswer,
      PlayerProgress,
      CoreModule,
      UserStatistic,
    ]),
  ],
  controllers: [GameController, UsersStatisticsController],
  providers: [
    ConnectToGameUseCase,
    GameRepository,
    GameQuestionsRepository,
    GameQueryRepository,
    PlayerProgressRepository,
    AnswerRepository,
    GetGameByIdHandler,
    GetCurrentUserGameHandler,
    GetUsersTopQueryHandler,
    SendAnswerUseCase,
    UsersStatisticsRepository,
    GetMyGamesQueryHandler,
    GetMyStatisticQueryHandler,
    UsersStatisticsQueryRepository,
  ],

  exports: [],
})
export class GameQuizModule {}
