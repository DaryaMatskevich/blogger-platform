import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionInputDto } from '../../api/input-dto/sessions.input-dto';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { SessionsRepository } from '../../../../../modules/user-accounts/sessions/infrastructure/sessions.repository';

export class CreateSessionCommand {
  constructor(public dto: CreateSessionInputDto) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute(command: CreateSessionCommand): Promise<void> {
    try {
      const lastActiveDate = new Date();
      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 10);

      const session = {
        userId: command.dto.userId,
        ip: command.dto.ip,
        title: command.dto.title,
        deviceId: command.dto.deviceId,
        refreshToken: command.dto.refreshToken,
        lastActiveDate: lastActiveDate,
        expirationDate: expirationDate,
      };

      await this.sessionsRepository.create(session);
    } catch (error) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: `Failed to create user: ${error.message}`,
      });
    }
  }
}
