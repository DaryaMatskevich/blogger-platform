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


  @Prop({ type: String, required: true })
  postId: string;

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


  static createInstance(dto: CreateCommentDto, postId: string): CommentDocument {
    const comment = new this();
    comment.postId = postId,
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

  changeLikesCounter(
    oldStatus: string,
    newStatus: string,
  ) {

    // 1. Обновляем счетчики
    if (oldStatus === "Like") {
      this.likesInfo.likesCount--;
    } else if (oldStatus === "Dislike") {
      this.likesInfo.dislikesCount--;
    }

    if (newStatus === "Like") {
      this.likesInfo.likesCount++;
    } else if (newStatus === "Dislike") {
      this.likesInfo.dislikesCount++;
    }
console.log(this.likesInfo.likesCount)
console.log(this.likesInfo.dislikesCount)
    // Гарантируем неотрицательные значения
    this.likesInfo.likesCount = Math.max(this.likesInfo.likesCount, 0);
    this.likesInfo.dislikesCount = Math.max(this.likesInfo.dislikesCount, 0);

  }

}



export const CommentSchema = SchemaFactory.createForClass(Comment);

//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

//Типизация документа
export type CommentDocument = HydratedDocument<Comment>;

//Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;