import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateSessionDomainDto } from './dto/create-session.domain.dto';


@Schema({ timestamps: true })

export class Session {

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, min: 5, required: true })
  lastActiveDate: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  @Prop({ required: true, type: Date })
  expirationDate: Date;

  @Prop({ type: String, required: true })
  refreshToken: string;


  static createInstance(dto: CreateSessionDomainDto): SessionDocument {
    const session = new this();
    session.userId = dto.userId,
      session.ip = dto.ip;
    session.title = dto.title;
    session.lastActiveDate = dto.lastActiveDate;
    session.deviceId = dto.deviceId;
    session.expirationDate = dto.expirationDate;
    session.refreshToken = dto.refreshToken
   


    return session as SessionDocument;
  }

  updateLastActiveDate(newDate?: Date): void {
    // Используем переданную дату или текущее время
    const dateToSet = newDate || new Date();
    
    // Обновляем дату в ISO формате
    this.lastActiveDate = dateToSet.toISOString();
    
     const expirationMs = 20 * 1000;
   this.expirationDate = new Date(dateToSet.getTime() + expirationMs);
  }
  
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  updateRefreshToken(newRefreshToken: string) {
this.refreshToken = newRefreshToken
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);

//регистрирует методы сущности в схеме
SessionSchema.loadClass(Session);

//Типизация документа
export type SessionDocument = HydratedDocument<Session>;

//Типизация модели + статические методы
export type SessionModelType = Model<SessionDocument> & typeof Session;