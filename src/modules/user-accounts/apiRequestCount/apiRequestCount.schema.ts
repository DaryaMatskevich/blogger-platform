import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Model } from 'mongoose';

@Schema({
  collection: 'api_request_counts',
  timestamps: false,
  versionKey: false,
})
export class ApiRequestCount extends Document {
  @Prop({
    required: true,
    index: true,
    type: String,
  })
  IP: string;

  @Prop({
    required: true,
    index: true,
    type: String,
  })
  URL: string;

  @Prop({
    type: Date,
    required: true,
    default: Date.now,
    index: true,
    expires: 10, // TTL в секундах (10 секунд)
  })
  date: Date;
}

export const ApiRequestCountSchema = SchemaFactory.createForClass(ApiRequestCount);


ApiRequestCountSchema.loadClass(ApiRequestCount);

//Типизация документа
export type UserDocument = HydratedDocument<ApiRequestCount>;

//Типизация модели + статические методы
export type ApiRequestCountModelType = Model<UserDocument> & typeof ApiRequestCount;