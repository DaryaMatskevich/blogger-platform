import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { HydratedDocument, Model } from "mongoose";

@Schema({ timestamps: true })
export class LikeComment {

    @Prop({ type: String, required: true })
    addedAt: string;

    @Prop({ type: String, required: true })
    commentId: string;

    @Prop({ type: String, required: true })
    userId: string;


    @Prop({ type: String, required: true })
    status: string;


    static createLikeComment(
        this: LikeCommentModelType,
        userId: string,
        likeStatus: string,
        commentId: string): LikeCommentDocument {
        const like = new this();
        like.addedAt = (new Date()).toISOString()
        like.userId = userId;
        like.status = likeStatus;
        like.commentId = commentId

        return like as LikeCommentDocument;
    }

    updateStatus(newStatus: string) {
        this.status = newStatus;
        this.addedAt = new Date().toISOString()
    }
}

export const LikeCommentSchema = SchemaFactory.createForClass(LikeComment);

//регистрирует методы сущности в схеме
LikeCommentSchema.loadClass(LikeComment);

//Типизация документа
export type LikeCommentDocument = HydratedDocument<LikeComment>;

//Типизация модели + статические методы
export type LikeCommentModelType = Model<LikeCommentDocument> & typeof LikeComment;