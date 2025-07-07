import { PostDocument } from "../../domain/post.entity";

type LikeInfo = {
  addedAt: Date;
  userId: string;
  login: string;
};

type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: LikeInfo[];
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo

  static mapToView(post: PostDocument): PostViewDto {
    const dto = new PostViewDto();
    
    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo?.likesCount || 0,
      dislikesCount: post.extendedLikesInfo?.dislikesCount || 0,
      myStatus: post.extendedLikesInfo?.myStatus || "None",
      newestLikes: post.extendedLikesInfo?.newestLikes?.map(like => ({
        addedAt: like.addedAt,
        userId: like.userId,
        login: like.login
      })) || []
    };



    return dto;
  }
}