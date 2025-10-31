import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly dataSource: DataSource) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { id } = command;

    // Выполняем soft delete и проверяем результат
    const result = await this.dataSource.query(
      `UPDATE users
       SET "deletedAt" = NOW()
       WHERE id = $1 AND "deletedAt" IS NULL
         RETURNING id`,
      [id],
    );

    // Если ни одна запись не была обновлена
    if (result.length === 0) {
      // Проверяем, существует ли пользователь вообще
      const existingUser = await this.dataSource.query(
        `SELECT 1 FROM users WHERE id = $1`,
        [id],
      );

      if (!existingUser[0]) {
        throw new NotFoundException('User not found');
      } else {
        throw new NotFoundException('User already deleted');
      }
    }
  }
}
