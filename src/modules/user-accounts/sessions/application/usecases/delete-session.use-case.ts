import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { SessionsQueryRepository } from '../../../../../modules/user-accounts/sessions/infrastructure/query/sessions.query-repository';

export class DeleteSessionCommand {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand>
{
  constructor(
    private sessionsRepository: SessionsRepository,
    private sessionsQueryRepository: SessionsQueryRepository,
  ) {}

  async execute(command: DeleteSessionCommand) {
    const session = await this.sessionsQueryRepository.findByDeviceId(
      command.deviceId,
    );
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Not found',
      });
    }
    if (command.userId !== session.userId)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });

    const deleted = await this.sessionsRepository.deleteSessionById(
      command.deviceId,
      command.userId,
    );
    if (!deleted) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Error deleting session',
      });
    }
  }
}
