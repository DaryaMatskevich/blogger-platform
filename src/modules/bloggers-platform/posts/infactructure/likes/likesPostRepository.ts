import { Injectable } from "@nestjs/common";
import { LikePost, LikePostDocument, LikePostModelType } from "../../domain/likes/like.entity";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class LikesPostRepository {
  constructor(@InjectModel(LikePost.name) private LikePostModel: LikePostModelType) { }


  async getLikeStatusByUserId(userId: string, postId: string): Promise<LikePostDocument | null> {


    const likePost = await this.LikePostModel.findOne({
      userId: userId,
      postId: postId
    }).lean()
    return likePost || null;
  }

  async save(likePost: LikePostDocument) {
    await likePost.save();
  }
}