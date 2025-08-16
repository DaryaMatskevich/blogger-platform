import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { CreateSessionInputDto } from "../../api/input-dto/sessions.input-dto";
import { Session, SessionModelType } from "../../domain/session.entity";
import { SessionRepository } from "../../infrastructure/sessions.repository";

export class CreateSessionCommand {
  constructor(
    public dto: CreateSessionInputDto,
  ) { }
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand> {
  constructor(
    private sessionRepository: SessionRepository,
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
  ) { }

  async execute(command: CreateSessionCommand): Promise<string> {

    const lastActiveDate = new Date().toISOString()
 const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 10);

    const session = this.SessionModel.createInstance({
      userId: command.dto.userId,
      ip: command.dto.ip,
      title: command.dto.title,
      lastActiveDate: lastActiveDate,
      deviceId: command.dto.deviceId,
      expirationDate: expirationDate
    });

    await this.sessionRepository.save(session);
    console.log(session)
    return session._id.toString();
  }
}