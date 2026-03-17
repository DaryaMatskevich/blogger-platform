import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Question } from '../../../../modules/sa/sa.quiz-questions/domain/question.entity';
import { CreateQuestionInputDto } from '../../../../modules/sa/sa.quiz-questions/api/dto/input/create-question.input-dto';
import { UpdateQuestionInputDto } from '../../../../modules/sa/sa.quiz-questions/api/dto/input/update-question.input-dto';

@Injectable()
export class QuestionRepository extends Repository<Question> {
  constructor(private dataSource: DataSource) {
    super(Question, dataSource.createEntityManager());
  }

  async createQuestion(dto: CreateQuestionInputDto): Promise<number> {
    const question = this.create({
      body: dto.body,
      correctAnswers: dto.correctAnswers,
      published: false, // По умолчанию не опубликован
    });

    const savedQuestion = await this.save(question);
    return savedQuestion.id; // Возвращаем только ID
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const result = await this.delete(id);
    return result.affected === 1;
  }

  async publishQuestion(id: number, published: boolean): Promise<boolean> {
    const result = await this.update(id, { published, updatedAt: new Date() });
    return result.affected === 1;
  }
  async updateQuestion(
    id: number,
    dto: UpdateQuestionInputDto,
  ): Promise<Question | null> {
    const question = await this.findOneBy({ id });
    if (!question) {
      return null;
    }
    if (dto.body !== undefined) question.body = dto.body;
    if (dto.correctAnswers !== undefined)
      question.correctAnswers = dto.correctAnswers;
    if (dto.published !== undefined) question.published = dto.published;

    question.updatedAt = new Date();

    return this.save(question);
  }
}
