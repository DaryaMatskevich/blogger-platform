import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comments.view.dto';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';



@Injectable()
export class CommentsQueryRepository {
    constructor(
        @InjectModel(Comment.name)
        private CommentModel: CommentModelType,
    ) { }

    async getByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
        const comment = await this.CommentModel.findOne({
            _id: id,
            deletedAt: null,
        });

        if (!comment) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: "Post not found",
            })
        }

        return CommentViewDto.mapToView(comment);
    }

}