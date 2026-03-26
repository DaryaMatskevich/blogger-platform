import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerProgressRepository } from '../../infrastructure/player-progress.repository';
import { GameQuestionsRepository } from '../../infrastructure/game-questions.repository';
import { QuestionQueryRepository } from '../../../../modules/sa/sa.quiz-questions/infrastructure/query/question-query.repository';

@Injectable()
export class ConnectToGameCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(ConnectToGameCommand)
export class ConnectToGameUseCase
  implements ICommandHandler<ConnectToGameCommand, string>
{
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly playerProgressRepository: PlayerProgressRepository,
    private readonly questionQueryRepository: QuestionQueryRepository,
    private readonly gameQuestionsRepository: GameQuestionsRepository,
  ) {}

  async execute(command: ConnectToGameCommand): Promise<string> {
    const { userId } = command;
    const userIdNumber = Number(userId);

    const existingActiveGame =
      await this.gameRepository.findActiveGameByUserId(userIdNumber);
    if (existingActiveGame) {
      throw new ForbiddenException(
        'User is already participating in an active pair',
      );
    }

    const pendingGame = await this.gameRepository.findPendingGame();

    if (pendingGame) {
      // Репозиторий создаёт и сохраняет прогресс
      const secondProgress =
        await this.playerProgressRepository.createPlayerProgress(userIdNumber);

      const game = await this.gameRepository.addSecondPlayerAndStart(
        pendingGame,
        secondProgress,
      );

      const questions =
        await this.questionQueryRepository.getRandomQuestions(5);
      await this.gameQuestionsRepository.createGameQuestions(game, questions);

      return game.id;
    } else {
      const firstProgress =
        await this.playerProgressRepository.createPlayerProgress(userIdNumber);
      const game = await this.gameRepository.createGame(firstProgress);

      return game.id;
    }
  }
}
