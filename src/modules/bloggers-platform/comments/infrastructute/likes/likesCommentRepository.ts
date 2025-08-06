import { Injectable } from "@nestjs/common";
import { LikeComment, LikeCommentDocument, LikeCommentModelType,  } from "../../domain/likes/like.entity";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class LikesCommentRepository {
  constructor(@InjectModel(LikeComment.name) private LikeCommentModel: LikeCommentModelType) { }


  async getLikeCommentByUserId(userId: string, commentId: string): Promise<LikeCommentDocument | null> {


    const likeComment = await this.LikeCommentModel.findOne({
      userId: userId,
      commentId: commentId
    }).exec()
    return likeComment || null;
  }

  async save(LikeComment: LikeCommentDocument) {
    await LikeComment.save();
  }
}