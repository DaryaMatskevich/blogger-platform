import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { QuestionRepository } from '../../infrastructure/quiz-questions.repository';

export class DeleteQuestionCommand {
  constructor(public readonly questionId: number) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand, void>
{
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(command: DeleteQuestionCommand): Promise<void> {
    const { questionId } = command;
    const deleted = await this.questionRepository.deleteQuestion(questionId);
    if (!deleted) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }
  }
}
