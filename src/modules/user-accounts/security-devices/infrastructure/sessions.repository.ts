import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Session, SessionDocument, SessionModelType } from '../domain/session.entity';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';

@Injectable()
export class SessionRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(Session.name) private SessionModel: SessionModelType) { }

  async findById(id: string): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(session: SessionDocument) {
    await session.save();
  }

  async findOrNotFoundFail(id: string): Promise<SessionDocument> {
    const session = await this.findById(id);

    if (!session) {

      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Session not found"
      })
    }

    return session;
  }


  async deleteSessionById(deviceId: string, userId: string): Promise<boolean> {
    const result = await this.SessionModel.deleteOne({

      deviceId: deviceId,
      userId: userId
    })
    return result.deletedCount === 1;
  }

  async deleteAllSessionsExcludeCurrent(userId: string, deviceId: string): Promise<boolean> {
    const result = await this.SessionModel.deleteMany(
      {
        userId: userId,
        deviceId: { $ne: deviceId }
      }
    )
    return result.deletedCount > 0;
  }
}