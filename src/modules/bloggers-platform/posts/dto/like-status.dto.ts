import { IsEnum, IsNotEmpty } from "class-validator";

enum LikeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike'
}

export class LikeInputModel {
    @IsNotEmpty()
    @IsEnum(LikeStatus, {
        message: 'likeStatus must be one of: None, Like, Dislike'
    })
    likeStatus: LikeStatus;
}