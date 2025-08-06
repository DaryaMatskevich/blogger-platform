import { Injectable } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { LikeComment, LikeCommentDocument, LikeCommentModelType } from "../../domain/likes/like.entity";

@Injectable()
export class LikesCommentQueryRepository {
constructor(@InjectModel(LikeComment.name) private LikePostModel: LikeCommentModelType) {}
     
  }

