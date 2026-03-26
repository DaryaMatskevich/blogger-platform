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
  status: 'Pending' | 'Active' | 'Finished';
  pairCreateDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
}
