import { Injectable } from "@nestjs/common";
import { LikePost, LikePostDocument, LikePostModelType } from "../../domain/likes/like.entity";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class LikesPostQueryRepository {
constructor(@InjectModel(LikePost.name) private LikePostModel: LikePostModelType) {}
     
async getNewestLikes(
    postId: string,
    limit: number
  ): Promise<LikePostDocument[]> {
    return this.LikePostModel
      .find({ postId, status: "Like" })
      .sort({ addedAt: -1 })
      .limit(limit)
      .exec();
  }

}