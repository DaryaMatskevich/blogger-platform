export class AnswerResponseDto {
  questionId: string;
  answerStatus: 'Correct' | 'Incorrect';
  addedAt: string;
}
