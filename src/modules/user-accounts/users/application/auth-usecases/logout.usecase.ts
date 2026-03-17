import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { SessionsQueryRepository } from '../../../../../modules/user-accounts/sessions/infrastructure/query/sessions.query-repository';
import { SessionsRepository } from '../../../../../modules/user-accounts/sessions/infrastructure/sessions.repository';

export class LogOutCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(LogOutCommand)
export class LogOutUseCase implements ICommandHandler<LogOutCommand> {
  constructor(
    private sessionsQueryRepository: SessionsQueryRepository,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute(command: LogOutCommand): Promise<void> {
    // Находим сессию по deviceId

    const session = await this.sessionsQueryRepository.findByDeviceId(
      command.deviceId,
    );

    if (!session || session.userId.toString() !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    // Помечаем сессию как удаленную
    const deletedSession = await this.sessionsRepository.deleteSessionById(
      command.deviceId,
      command.userId,
    );
    if (!deletedSession) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'BadRequest',
      });
    }
  }
}
