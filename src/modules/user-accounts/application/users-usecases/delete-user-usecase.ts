import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly dataSource: DataSource) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { id } = command;

    // 1. Проверяем существование
    const userResult = await this.dataSource.query(
      `SELECT 1 FROM users WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );

    if (!userResult[0]) {
      throw new NotFoundException('User not found'); // ← 404
    }

    // 2. Soft delete
    const result = await this.dataSource.query(
      `UPDATE users SET "deletedAt" = NOW() WHERE id = $1 AND "deletedAt" IS NULL RETURNING id`,
      [id],
    );

    if (!result[0]) {
      throw new InternalServerErrorException('Failed to delete user'); // ← 500
    }

    // void — ничего не возвращаем
  }
}
