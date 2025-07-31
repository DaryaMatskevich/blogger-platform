import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikesInfo, LikesInfoSchema } from './likesInfo.schema';
import { CommentatorInfo, CommentatorInfoSchema } from './commentatorInfo.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

export const contentConstraints = {
  minLength: 20,
  maxLength: 300
}

@Schema({ timestamps: true })

export class Comment {



  @Prop({ type: String, required: true, ...contentConstraints })
  content: string;

  @Prop({ type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  createdAt: Date;

  updatedAt: Date;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  @Prop({
    required: true,
    type: LikesInfoSchema,
    default: () => ({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    })
  })
  likesInfo: LikesInfo;


  static createInstance(dto: CreateCommentDto): CommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.commentatorInfo = {
      userId: dto.commentatorInfo.userId,
      userLogin: dto.commentatorInfo.userLogin
    };
    return comment as CommentDocument
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateCommentDto) {
    if (dto.content !== this.content) {
      this.content = dto.content;
    }
  }
  
  changeLikeStatus(newStatus: 'Like' | 'Dislike' | 'None') {
    const currentStatus = this.likesInfo.myStatus;

    if (currentStatus === newStatus) return;

    if (currentStatus === 'Like') {
      this.likesInfo.likesCount = Math.max(this.likesInfo.likesCount - 1, 0);
    } else if (currentStatus === 'Dislike') {
      this.likesInfo.dislikesCount = Math.max(this.likesInfo.dislikesCount - 1, 0);
    }

    if (newStatus === 'Like') {
      this.likesInfo.likesCount += 1;
    } else if (newStatus === 'Dislike') {
      this.likesInfo.dislikesCount += 1;
    }

    this.likesInfo.myStatus = newStatus;
  }
}



export const CommentSchema = SchemaFactory.createForClass(Comment);

//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

//Типизация документа
export type CommentDocument = HydratedDocument<Comment>;

//Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;