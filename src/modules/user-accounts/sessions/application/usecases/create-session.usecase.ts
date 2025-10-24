import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionInputDto } from '../../api/input-dto/sessions.input-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../../domain/session.entity';

export class CreateSessionCommand {
  constructor(public dto: CreateSessionInputDto) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async execute(command: CreateSessionCommand): Promise<string> {
    const lastActiveDate = new Date();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 10);

    const session = Session.createInstance({
      userId: command.dto.userId,
      ip: command.dto.ip,
      title: command.dto.title,
      lastActiveDate: lastActiveDate,
      deviceId: command.dto.deviceId,
      expirationDate: expirationDate,
      refreshToken: command.dto.refreshToken,
    });

    const savedSession = await this.sessionRepository.save(session);

    return savedSession.id.toString();
  }
}
