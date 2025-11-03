import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../infrastructure/sessions.repository';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';

export class DeleteSessionCommand {
  constructor(
    public deviceId: string,
    public userId: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand>
{
  constructor(private sessionRepository: SessionRepository) {}

  async execute(command: DeleteSessionCommand) {
    const session = await this.sessionRepository.findByDeviceId(
      command.deviceId,
    );
    if (command.userId !== session.userId)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });

    await this.sessionRepository.deleteSessionById(
      command.deviceId,
      command.userId,
    );
  }
}
