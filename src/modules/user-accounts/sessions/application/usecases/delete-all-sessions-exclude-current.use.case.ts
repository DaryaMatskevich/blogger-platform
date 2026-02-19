import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';

export class DeleteAllSessionsExcludeCurrentCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteAllSessionsExcludeCurrentCommand)
export class DeleteAllSessionsExcludeCurrentUseCase
  implements ICommandHandler<DeleteAllSessionsExcludeCurrentCommand>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute(command: DeleteAllSessionsExcludeCurrentCommand) {
    const deleted =
      await this.sessionsRepository.deleteAllSessionsExcludeCurrent(
        command.userId,
        command.deviceId,
      );

    if (!deleted) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No active sessions found to delete',
      });
    }
  }
}
