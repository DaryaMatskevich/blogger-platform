import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikesInfo, LikesInfoSchema } from './likesInfo.schema';
import { CommentatorInfo, CommentatorInfoSchema } from './commentatorInfo.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';



@Schema({ timestamps: true })

export class Comment {

    @Prop({ type: String, required: true })
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


    static createInstance(dto: CreateCommentDto ): CommentDocument {
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
}


export const CommentSchema = SchemaFactory.createForClass(Comment);

//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

//Типизация документа
export type CommentDocument = HydratedDocument<Comment>;

//Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;