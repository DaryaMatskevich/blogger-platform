import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NewestLike {
  @Prop({ required: true, type: Date })
  addedAt: Date;

  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: true, type: String })
  login: string;
}

export const NewestLikeSchema = SchemaFactory.createForClass(NewestLike);

@Schema({_id: false,})
export class ExtendedLikesInfo {
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

  @Prop({ 
    required: true, 
    type: [NewestLikeSchema], 
    default: [] 
  })
  newestLikes: NewestLike[];
}

export const ExtendedLikesInfoSchema = SchemaFactory.createForClass(ExtendedLikesInfo);
