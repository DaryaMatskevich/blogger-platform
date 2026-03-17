import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { QuestionRepository } from '../../infrastructure/quiz-questions.repository';

export class PublishQuestionCommand {
  constructor(
    public readonly questionId: number,
    public readonly published: boolean,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase
  implements ICommandHandler<PublishQuestionCommand, void>
{
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(command: PublishQuestionCommand): Promise<void> {
    const { questionId, published } = command;
    const updated = await this.questionRepository.publishQuestion(
      questionId,
      published,
    );
    if (!updated) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }
  }
}
