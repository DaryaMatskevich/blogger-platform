import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema({_id: false,})
export class LikesInfo {
   @Prop({ required: true, type: Number, default: 0 })
  likesCount: number;

  @Prop({ required: true, type: Number, default: 0 })
 dislikesCount: number;

  @Prop({ 
    required: true, 
    type: String, 
    enum: ['None', 'Like', 'Dislike'], 
    default: 'None' 
  })
  myStatus: string;

}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo)
