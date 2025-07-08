import { CommentDocument } from "../../domain/comment.entity";


type CommentatorInfo = {
    userId: string;
    userLogin: string;
};

type LikesInfo = {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;

};

export class CommentViewDto {
    id: string;
    content: string;
    commentatorInfo: CommentatorInfo;
    createdAt: Date;
    likesInfo: LikesInfo

    static mapToView(comment: CommentDocument): CommentViewDto {
        const dto = new CommentViewDto();

        dto.id = comment._id.toString();
        dto.content = comment.content;
dto.commentatorInfo = {
    userId: comment.commentatorInfo.userId,
    userLogin: comment.commentatorInfo.userLogin
}
        dto.createdAt = comment.createdAt;
        dto.likesInfo = {
            likesCount: comment.likesInfo?.likesCount || 0,
            dislikesCount: comment.likesInfo?.dislikesCount || 0,
            myStatus: comment.likesInfo?.myStatus || "None",
        };



        return dto;
    }
}