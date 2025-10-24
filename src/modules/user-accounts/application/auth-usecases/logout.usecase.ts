import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../sessions/infrastructure/sessions.repository';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';

export class LogOutCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(LogOutCommand)
export class LogOutUseCase implements ICommandHandler<LogOutCommand> {
  constructor(private sessionsRepository: SessionRepository) {}

  async execute(command: LogOutCommand): Promise<void> {
    const session = await this.sessionsRepository.findByDeviceId(
      command.deviceId,
    );
    console.log('сессия найдена');

    if (session?.userId !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    session.makeDeleted();
    await this.sessionsRepository.save(session);

    console.log(session.deletedAt);
  }
}
