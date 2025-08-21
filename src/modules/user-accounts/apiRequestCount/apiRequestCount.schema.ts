import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ApiRequestCount extends Document {
  @Prop({ required: true })
  IP: string;

  @Prop({ required: true })
  URL: string;

  @Prop({ required: true, type: Date })
  date: Date;
}

export const ApiRequestCountSchema = SchemaFactory.createForClass(ApiRequestCount);

// Добавьте индексы для производительности
ApiRequestCountSchema.index({ IP: 1, URL: 1 });
ApiRequestCountSchema.index({ date: 1 }, { expireAfterSeconds: 10 });