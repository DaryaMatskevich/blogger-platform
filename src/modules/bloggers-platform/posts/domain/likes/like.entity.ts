import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LikeInputModel } from "../../dto/like-status.dto";
import { HydratedDocument, Model } from "mongoose";

@Schema({ timestamps: true })

export class LikePost {

    @Prop({ type: String, required: true })
    addedAt: string;

    @Prop({ type: String, required: true })
    postId: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    login: string;

    @Prop({ type: String, required: true })
    status: string;


    static createLikePost(
        this: LikePostModelType,
        userId: string,
        login: string,
        likeStatus: string,
        postId: string): LikePostDocument {
        const like = new this();
        like.addedAt = (new Date()).toISOString()
        like.userId = userId;
        like.login = login;
        like.status = likeStatus;
        like.postId = postId

        return like as LikePostDocument;
    }

    updateStatus(newStatus: string) {
        this.status = newStatus;
        this.addedAt = new Date().toISOString()
    }
}

export const LikePostSchema = SchemaFactory.createForClass(LikePost);

//регистрирует методы сущности в схеме
LikePostSchema.loadClass(LikePost);

//Типизация документа
export type LikePostDocument = HydratedDocument<LikePost>;

//Типизация модели + статические методы
export type LikePostModelType = Model<LikePostDocument> & typeof LikePost;