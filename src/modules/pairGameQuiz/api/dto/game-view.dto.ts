export class GameViewDto {
  id: string;
  firstPlayerId: string;
  secondPlayerId: string | null;
  status: 'Pending' | 'Active' | 'Finished';
  questions: QuestionDto[] | null;
  firstPlayerAnswers: PlayerAnswerDto[] | null;
  secondPlayerAnswers: PlayerAnswerDto[] | null;
  createdAt: Date;
  startDate: Date | null;
  finishDate: Date | null;
}

class QuestionDto {
  id: string;
  body: string;
}

class PlayerAnswerDto {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  createdAt: Date;
}
