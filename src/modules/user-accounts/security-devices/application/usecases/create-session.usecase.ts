import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { CreateSessionInputDto } from "../../api/input-dto/sessions.input-dto";
import { Session, SessionModelType } from "../../domain/session.entity";

export class CreateSessionCommand {
  constructor(
    public dto: CreateSessionInputDto,
  ) { }
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand> {
  constructor(
    
   
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
      expirationDate: expirationDate,
      refreshToken: command.dto.refreshToken

    });

    await session.save()
    
    return session._id.toString();
  }
}