// application/use-cases/send-answer.usecase.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GameRepository } from '../../infrastructure/game.repository';
import { AnswerResponseDto } from '../../api/dto/answer-response.dto';
import { GameStatus } from '../../domain/game.entity';
import { AnswerStatus, PlayerAnswer } from '../../domain/player-answer.entity';
import { GameQueryRepository } from '../../../../modules/pairGameQuiz/infrastructure/query/game-query.repository';
import { AnswerRepository } from '../../../../modules/pairGameQuiz/infrastructure/answers.repository';
import { PlayerProgressRepository } from '../../../../modules/pairGameQuiz/infrastructure/player-progress.repository';

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
  ) {}

  async execute(command: SendAnswerCommand): Promise<AnswerResponseDto> {
    const { userId, answer } = command;
    const userIdNum = parseInt(userId, 10);
    // 1. Найти активную игру пользователя со всеми связями
    const game =
      await this.gameQueryRepository.findActiveGameByUserId(userIdNum);
    if (!game) {
      throw new ForbiddenException('User is not inside an active game');
    }

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
    const gameQuestions = game.questions.sort((a, b) => a.order - b.order);
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
    const correctAnswers = nextGameQuestion.question.correctAnswers || []; // предполагаем, что у Question есть поле correctAnswers: string[]
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

    // 7. Обновить счёт игрока, если ответ правильный
    if (isCorrect) {
      playerProgress.score += 1;
      await this.playerProgressRepository.savePlayerProgress(playerProgress);
    }

    // 8. Проверить, закончили ли оба игрока
    const firstProgressAnswersCount =
      game.firstPlayerProgress?.answers?.length || 0;
    const secondProgressAnswersCount =
      game.secondPlayerProgress?.answers?.length || 0;
    const totalQuestions = gameQuestions.length;

    const bothFinished =
      firstProgressAnswersCount === totalQuestions &&
      secondProgressAnswersCount === totalQuestions;
    if (bothFinished) {
      if (!game.firstPlayerProgress || !game.secondPlayerProgress) {
        // Этого не должно случиться, но на всякий случай
        throw new Error(
          'Both players must have progress when game is finished',
        );
      }
      game.status = GameStatus.Finished;
      game.finishGameDate = new Date();

      const firstProgress = game.firstPlayerProgress;
      const secondProgress = game.secondPlayerProgress;
      const getLastAnswerTime = (progress) => {
        if (!progress.answers || progress.answers.length === 0) return null;
        // сортируем ответы по дате добавления (от старых к новым) и берём последний
        const sorted = [...progress.answers].sort(
          (a, b) => a.addedAt.getTime() - b.addedAt.getTime(),
        );
        return sorted[sorted.length - 1].addedAt;
      };

      const firstFinishedAt = getLastAnswerTime(firstProgress);
      const secondFinishedAt = getLastAnswerTime(secondProgress);

      if (firstFinishedAt && secondFinishedAt) {
        if (firstFinishedAt < secondFinishedAt && firstProgress.score > 0) {
          firstProgress.score += 1;
          await this.playerProgressRepository.savePlayerProgress(firstProgress);
        } else if (
          secondFinishedAt < firstFinishedAt &&
          secondProgress.score > 0
        ) {
          secondProgress.score += 1;
          await this.playerProgressRepository.savePlayerProgress(
            secondProgress,
          );
        }
        // если времена равны – бонус не начисляем
      }
      await this.gameRepository.saveGame(game);
    }

    // 9. Вернуть DTO
    return {
      questionId: nextGameQuestion.question.id.toString(),
      answerStatus: isCorrect ? AnswerStatus.Correct : AnswerStatus.Incorrect,
      addedAt: playerAnswer.addedAt.toISOString(),
    };
  }
}
