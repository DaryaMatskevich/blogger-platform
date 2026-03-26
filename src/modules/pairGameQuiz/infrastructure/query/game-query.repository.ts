import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GameViewDto } from '../../api/dto/game-view.dto';
import {
  Game,
  GameStatus,
} from '../../../../modules/pairGameQuiz/domain/game.entity';
import { AnswerStatus } from '../../../../modules/pairGameQuiz/domain/answer.entity';

@Injectable()
export class GameQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findGameById(id: string): Promise<GameViewDto | null> {
    const game = await this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('firstProgress.player', 'firstPlayer')
      .leftJoinAndSelect('firstProgress.answers', 'firstAnswers')
      .leftJoinAndSelect('firstAnswers.gameQuestion', 'firstGameQuestion')
      .leftJoinAndSelect('firstGameQuestion.question', 'firstQuestion')
      .leftJoinAndSelect('g.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('secondProgress.player', 'secondPlayer')
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.gameQuestion', 'secondGameQuestion')
      .leftJoinAndSelect('secondGameQuestion.question', 'secondQuestion')
      .leftJoinAndSelect('g.questions', 'gameQuestions')
      .leftJoinAndSelect('gameQuestions.question', 'question')
      .where('g.id = :id', { id })
      .getOne();

    if (!game) return null;

    return this.mapToGameViewDto(game);
  }

  async findGameByIdAndUserId(
    gameId: string,
    userId: number,
  ): Promise<GameViewDto | null> {
    const game = await this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('firstProgress.player', 'firstPlayer')
      .leftJoinAndSelect('firstProgress.answers', 'firstAnswers')
      .leftJoinAndSelect('firstAnswers.gameQuestion', 'firstGameQuestion')
      .leftJoinAndSelect('firstGameQuestion.question', 'firstQuestion')
      .leftJoinAndSelect('g.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('secondProgress.player', 'secondPlayer')
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.gameQuestion', 'secondGameQuestion')
      .leftJoinAndSelect('secondGameQuestion.question', 'secondQuestion')
      .leftJoinAndSelect('g.questions', 'gameQuestions')
      .leftJoinAndSelect('gameQuestions.question', 'question')
      .where('g.id = :gameId', { gameId })
      .andWhere('(firstPlayer.id = :userId OR secondPlayer.id = :userId)', {
        userId,
      })
      .getOne();

    if (!game) return null;
    return this.mapToGameViewDto(game);
  }

  private mapToGameViewDto(game: Game): GameViewDto {
    // Формируем объект для первого игрока
    const firstPlayerProgress = game.firstPlayerProgress
      ? {
          answers: game.firstPlayerProgress.answers.map((answer) => ({
            questionId: answer.gameQuestion.question.id.toString(),
            answerStatus: answer.isCorrect
              ? AnswerStatus.Correct
              : AnswerStatus.Incorrect,
            addedAt: answer.answeredAt.toISOString(),
          })),
          player: {
            id: game.firstPlayerProgress.player.id.toString(),
            login: game.firstPlayerProgress.player.login,
          },
          score: game.firstPlayerProgress.score,
        }
      : null;

    // Формируем объект для второго игрока
    const secondPlayerProgress = game.secondPlayerProgress
      ? {
          answers: game.secondPlayerProgress.answers.map((answer) => ({
            questionId: answer.gameQuestion.question.id.toString(),
            answerStatus: answer.isCorrect
              ? AnswerStatus.Correct
              : AnswerStatus.Incorrect,
            addedAt: answer.answeredAt.toISOString(),
          })),
          player: {
            id: game.secondPlayerProgress.player.id.toString(),
            login: game.secondPlayerProgress.player.login,
          },
          score: game.secondPlayerProgress.score,
        }
      : null;

    const questions = game.questions.map((gameQuestion) => ({
      id: gameQuestion.question.id.toString(),
      body: gameQuestion.question.body,
    }));

    // Преобразование статуса
    let status: 'Pending' | 'Active' | 'Finished';
    if (game.status === GameStatus.PendingSecondPlayer) status = 'Pending';
    else if (game.status === GameStatus.Active) status = 'Active';
    else if (game.status === GameStatus.Finished) status = 'Finished';
    else status = 'Pending';

    return {
      id: game.id,
      firstPlayerProgress,
      secondPlayerProgress,
      questions,
      status,
      pairCreateDate: game.pairCreatedDate.toISOString(), // обратите внимание на название поля
      startGameDate: game.startGameDate?.toISOString() || null,
      finishGameDate: game.finishGameDate?.toISOString() || null,
    };
  }

  async findActiveGameByUserId(userId: number): Promise<GameViewDto | null> {
    const game = await this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('firstProgress.player', 'firstPlayer')
      .leftJoinAndSelect('firstProgress.answers', 'firstAnswers')
      .leftJoinAndSelect('firstAnswers.gameQuestion', 'firstGameQuestion')
      .leftJoinAndSelect('firstGameQuestion.question', 'firstQuestion')
      .leftJoinAndSelect('g.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('secondProgress.player', 'secondPlayer')
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.gameQuestion', 'secondGameQuestion')
      .leftJoinAndSelect('secondGameQuestion.question', 'secondQuestion')
      .leftJoinAndSelect('g.questions', 'gameQuestions')
      .leftJoinAndSelect('gameQuestions.question', 'question')
      .where('g.status IN (:...statuses)', {
        statuses: [GameStatus.PendingSecondPlayer, GameStatus.Active],
      })
      .andWhere('(firstPlayer.id = :userId OR secondPlayer.id = :userId)', {
        userId,
      })
      .getOne();

    return game ? this.mapToGameViewDto(game) : null;
  }
}
