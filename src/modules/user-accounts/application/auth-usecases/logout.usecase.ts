import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { DataSource } from 'typeorm';

export class LogOutCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(LogOutCommand)
export class LogOutUseCase implements ICommandHandler<LogOutCommand> {
  constructor(private dataSource: DataSource) {}

  async execute(command: LogOutCommand): Promise<void> {
    // Находим сессию по deviceId
    const findSessionQuery = `
      SELECT id, "userId", "deviceId", "deletedAt" 
      FROM sessions 
      WHERE "deviceId" = $1 AND "deletedAt" IS NULL
    `;

    const sessions = await this.dataSource.query(findSessionQuery, [
      command.deviceId,
    ]);
    const session = sessions[0];

    console.log('сессия найдена');

    if (!session || session.userId.toString() !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    // Помечаем сессию как удаленную
    const updateQuery = `
      UPDATE sessions 
      SET "deletedAt" = NOW() 
      WHERE id = $1 AND "deletedAt" IS NULL
    `;

    await this.dataSource.query(updateQuery, [session.id]);

    console.log(new Date()); // deletedAt timestamp
  }
}
