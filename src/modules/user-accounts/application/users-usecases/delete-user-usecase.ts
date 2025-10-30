import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { DomainException } from '@src/core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '@src/core/exeptions/domain-exeption-codes';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly dataSource: DataSource) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { id } = command;

    // 1. Проверяем, существует ли пользователь и не удалён ли
    const checkQuery = `
      SELECT id, "deletedAt" 
      FROM users 
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    const userResult = await this.dataSource.query(checkQuery, [id]);

    if (!userResult[0]) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    // 2. Soft delete: устанавливаем deletedAt = NOW()
    const deleteQuery = `
      UPDATE users 
      SET "deletedAt" = NOW() 
      WHERE id = $1 AND "deletedAt" IS NULL
      RETURNING id
    `;

    const result = await this.dataSource.query(deleteQuery, [id]);

    if (!result[0]) {
      throw new Error('Failed to delete user');
    }

    // Ничего не возвращаем — void
  }
}
