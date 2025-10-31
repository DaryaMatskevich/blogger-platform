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

    // 1. Проверяем существование
    const result = await this.dataSource.query(
      `SELECT 1 FROM users WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );

    if (result.length === 0) {
      // Либо пользователь не найден, либо уже удален
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
