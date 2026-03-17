// src/modules/quiz/dto/view/question.view-dto.ts
export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(question: any) {
    this.id = question.id;
    this.body = question.body;
    this.correctAnswers = question.correctAnswers;
    this.published = question.published;
    this.createdAt = question.createdAt;
    this.updatedAt = question.updatedAt;
  }
}
