// application/use-cases/send-answer.usecase.ts
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

    // 1. Найти активную игру
    const game =
      await this.gameQueryRepository.findActiveGameByUserId(userIdNum);
    if (!game || game.status !== GameStatus.Active) {
      throw new ForbiddenException('User is not inside an active game');
    }

    const totalQuestions = game.questions.length;

    // 2. Определить прогресс игрока
    const playerProgress =
      game.firstPlayerProgress?.player.id === userIdNum
        ? game.firstPlayerProgress
        : game.secondPlayerProgress?.player.id === userIdNum
          ? game.secondPlayerProgress
          : null;

    if (!playerProgress) {
      throw new ForbiddenException('User is not a player in this game');
    }

    // 3. Получить все вопросы игры, отсортированные по order
    const gameQuestions = [...game.questions].sort((a, b) => a.order - b.order);
    if (!gameQuestions.length) {
      throw new BadRequestException('No questions found for this game');
    }

    // 4. Найти следующий неотвеченный вопрос
    const answeredQuestionIds = playerProgress.answers.map(
      (a) => a.gameQuestion.id,
    );
    const nextGameQuestion = gameQuestions.find(
      (q) => !answeredQuestionIds.includes(q.id),
    );

    if (!nextGameQuestion) {
      throw new ForbiddenException('User has already answered all questions');
    }

    // 5. Проверить правильность ответа
    const correctAnswers = nextGameQuestion.question.correctAnswers || [];
    const isCorrect = correctAnswers.some(
      (correct) => correct.toLowerCase() === answer.trim().toLowerCase(),
    );

    // 6. Создать PlayerAnswer
    const playerAnswer = new PlayerAnswer();
    playerAnswer.playerProgress = playerProgress;
    playerAnswer.gameQuestion = nextGameQuestion;
    playerAnswer.answerStatus = isCorrect
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;
    playerAnswer.addedAt = new Date();

    await this.answerRepository.saveAnswer(playerAnswer);
    playerProgress.answers.push(playerAnswer);

    // 7. Обновить счёт, если ответ правильный
    if (isCorrect) {
      playerProgress.score += 1;
      await this.playerProgressRepository.savePlayerProgress(playerProgress);
    }

    // 8. Проверить, закончил ли текущий игрок все вопросы
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

      const otherFinished = isFirst
        ? game.secondPlayerFinishedAt !== null
        : game.firstPlayerFinishedAt !== null;

      if (otherFinished) {
        // Оба закончили – завершаем немедленно
        await this.finishGameService.finishGame(game, totalQuestions);
      } else {
        // Запускаем таймер на 10 секунд
        setTimeout(() => {
          void (async () => {
            try {
              const freshGame =
                await this.gameQueryRepository.findGameEntityById(game.id);
              if (freshGame && freshGame.status === GameStatus.Active) {
                const firstFinished = freshGame.firstPlayerFinishedAt !== null;
                const secondFinished =
                  freshGame.secondPlayerFinishedAt !== null;
                if (
                  (firstFinished && !secondFinished) ||
                  (!firstFinished && secondFinished)
                ) {
                  await this.finishGameService.finishGame(
                    freshGame,
                    totalQuestions,
                  );
                }
              }
            } catch (error) {
              console.error('Error in game timeout callback:', error);
            }
          })();
        }, 10000);
      }
    }

    // 9. Проверить, не закончили ли оба только что
    const firstProgressAnswersCount =
      game.firstPlayerProgress?.answers?.length || 0;
    const secondProgressAnswersCount =
      game.secondPlayerProgress?.answers?.length || 0;
    const bothFinishedNow =
      firstProgressAnswersCount === totalQuestions &&
      secondProgressAnswersCount === totalQuestions;

    if (bothFinishedNow && !game.finishGameDate) {
      await this.finishGameService.finishGame(game, totalQuestions);
    }

    return {
      questionId: nextGameQuestion.question.id.toString(),
      answerStatus: isCorrect ? AnswerStatus.Correct : AnswerStatus.Incorrect,
      addedAt: playerAnswer.addedAt.toISOString(),
    };
  }
}
