import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { QuestionRepository } from '../../infrastructure/quiz-questions.repository';
import { UpdateQuestionInputDto } from '../../api/dto/input/update-question.input-dto';

export class UpdateQuestionCommand {
  constructor(
    public readonly id: number,
    public readonly dto: UpdateQuestionInputDto,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand, void>
{
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(command: UpdateQuestionCommand): Promise<void> {
    const { id, dto } = command;
    const updated = await this.questionRepository.updateQuestion(id, dto);
    if (!updated) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
  }
}
