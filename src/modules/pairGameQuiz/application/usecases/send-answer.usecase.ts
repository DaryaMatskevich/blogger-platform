import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GameRepository } from '../../infrastructure/game.repository';
import { AnswerResponseDto } from '../../api/dto/answer-response.dto';
import { GameStatus } from '../../domain/game.entity';
import { AnswerStatus, PlayerAnswer } from '../../domain/player-answer.entity';
import { GameQueryRepository } from '../../infrastructure/query/game-query.repository';
import { AnswerRepository } from '../../infrastructure/answers.repository';
import { PlayerProgressRepository } from '../../infrastructure/player-progress.repository';
import { UsersStatisticsRepository } from '../../infrastructure/users-statistics.repository';
import { FinishGameService } from '../services/finish-game.service';

export class SendAnswerCommand {
  constructor(
    public readonly userId: string,
    public readonly answer: string,
  ) {}
}

@CommandHandler(SendAnswerCommand)
export class SendAnswerUseCase
  implements ICommandHandler<SendAnswerCommand, AnswerResponseDto>
{
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly playerProgressRepository: PlayerProgressRepository,
    private readonly usersStatisticsRepository: UsersStatisticsRepository,
    private readonly finishGameService: FinishGameService,
  ) {}

  async execute(command: SendAnswerCommand): Promise<AnswerResponseDto> {
    const { userId, answer } = command;
    const userIdNum = parseInt(userId, 10);

    const game =
      await this.gameQueryRepository.findActiveGameByUserId(userIdNum);
    if (!game || game.status !== GameStatus.Active) {
      throw new ForbiddenException('User is not inside an active game');
    }

    const totalQuestions = game.questions.length;

    const playerProgress =
      game.firstPlayerProgress?.player.id === userIdNum
        ? game.firstPlayerProgress
        : game.secondPlayerProgress?.player.id === userIdNum
          ? game.secondPlayerProgress
          : null;

    if (!playerProgress) {
      throw new ForbiddenException('User is not a player in this game');
    }

    const gameQuestions = [...game.questions].sort((a, b) => a.order - b.order);
    if (!gameQuestions.length) {
      throw new BadRequestException('No questions found for this game');
    }

    const answeredQuestionIds = playerProgress.answers.map(
      (a) => a.gameQuestion.id,
    );
    const nextGameQuestion = gameQuestions.find(
      (q) => !answeredQuestionIds.includes(q.id),
    );

    if (!nextGameQuestion) {
      throw new ForbiddenException('User has already answered all questions');
    }

    const correctAnswers = nextGameQuestion.question.correctAnswers || [];
    const isCorrect = correctAnswers.some(
      (correct) => correct.toLowerCase() === answer.trim().toLowerCase(),
    );

    const playerAnswer = new PlayerAnswer();
    playerAnswer.playerProgress = playerProgress;
    playerAnswer.gameQuestion = nextGameQuestion;
    playerAnswer.answerStatus = isCorrect
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;
    playerAnswer.addedAt = new Date();

    await this.answerRepository.saveAnswer(playerAnswer);
    playerProgress.answers.push(playerAnswer);

    if (isCorrect) {
      playerProgress.score += 1;
      // Используем updateScore вместо savePlayerProgress
      await this.playerProgressRepository.updateScore(
        playerProgress.id,
        playerProgress.score,
      );
    }

    const currentAnswersCount = playerProgress.answers.length;
    const isCurrentFinished = currentAnswersCount === totalQuestions;

    if (isCurrentFinished) {
      const isFirst = game.firstPlayerProgress?.player.id === userIdNum;
      if (isFirst) {
        game.firstPlayerFinishedAt = new Date();
      } else {
        game.secondPlayerFinishedAt = new Date();
      }
      await this.gameRepository.saveGame(game);
    }

    if (!game.firstPlayerProgress || !game.secondPlayerProgress) {
      throw new ForbiddenException('Game is missing player progress data');
    }
    const firstProgressAnswersCount = await this.answerRepository.count({
      where: { playerProgress: { id: game.firstPlayerProgress.id } },
    });
    const secondProgressAnswersCount = await this.answerRepository.count({
      where: { playerProgress: { id: game.secondPlayerProgress.id } },
    });

    const bothFinishedNow =
      firstProgressAnswersCount === totalQuestions &&
      secondProgressAnswersCount === totalQuestions;

    if (bothFinishedNow && !game.finishGameDate) {
      // Убираем totalQuestions
      await this.finishGameService.finishGame(game);
    }

    return {
      questionId: nextGameQuestion.question.id.toString(),
      answerStatus: isCorrect ? AnswerStatus.Correct : AnswerStatus.Incorrect,
      addedAt: playerAnswer.addedAt.toISOString(),
    };
  }
}
