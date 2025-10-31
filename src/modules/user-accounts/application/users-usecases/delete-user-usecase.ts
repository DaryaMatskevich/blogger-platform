import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { UsersQueryRepository } from '../../../user-accounts/infastructure/query/users.query-repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private readonly dataSource: DataSource,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { id } = command;
    const user = await this.usersQueryRepository.getByIdOrNotFoundFail(id);
    if (user) {
      // Валидация ID (опционально, но рекомендуется)

      // Атомарная операция: проверяем и удаляем в одном запросе
      await this.dataSource.query(
        `UPDATE users 
       SET "deletedAt" = NOW()
       WHERE id = $1 AND "deletedAt" IS NULL 
       RETURNING id`,
        [id],
      );
    }
  }
}
// Если ни одна запись не была обновлена, пользователь не найден или уже удален
