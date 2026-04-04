import { GameStatus } from '../../../../modules/pairGameQuiz/domain/game.entity';

export class GameViewDto {
  id: string;
  firstPlayerProgress: {
    answers: { questionId: string; answerStatus: string; addedAt: string }[];
    player: { id: string; login: string };
    score: number;
  } | null;
  secondPlayerProgress: {
    answers: { questionId: string; answerStatus: string; addedAt: string }[];
    player: { id: string; login: string };
    score: number;
  } | null;
  questions: { id: string; body: string }[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
}

export class MyGamesViewDto {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: GameViewDto[];
}
