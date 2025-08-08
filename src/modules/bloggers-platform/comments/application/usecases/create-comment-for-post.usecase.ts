import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { CreateCommentInputDto } from "../../api/input-dto/comment.input-dto";
import { Comment, CommentModelType } from "../../domain/comment.entity";
import { CommentsRepository } from "../../infrastructute/comments.repository";
import { UsersExternalQueryRepository } from "../.../../../../../../modules/user-accounts/infastructure/external-query/external-dto/users.external-query-repository";
import { PostsService } from "../../../../../modules/bloggers-platform/posts/application/posts.service";
import { DomainException } from "../../../../../core/exeptions/domain-exeptions";
import { DomainExceptionCode } from "../../../../../core/exeptions/domain-exeption-codes";

export class CreateCommentForPostCommand {
    constructor(public postId: string,
        public userId: string,
        public dto: CreateCommentInputDto
    ) { }
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase
    implements ICommandHandler<CreateCommentForPostCommand> {
    constructor(
        @InjectModel(Comment.name)
        private commentModel: CommentModelType,
        private commentsRepository: CommentsRepository,
        private usersExternalQueryRepository: UsersExternalQueryRepository,
        private postsService: PostsService,

    ) { }

    async execute(command: CreateCommentForPostCommand): Promise<string> {
        const postExist = await this.postsService.postExists(command.postId)

        if (!postExist) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: "Post not found",
            })
        }

        const user = await this.usersExternalQueryRepository.getByIdOrNotFoundFail(command.userId)

        const commentDto = {
            content: command.dto.content,
            commentatorInfo: {
                userId: user.id,
                userLogin: user.login
            }
        }

        const comment = this.commentModel.createInstance(commentDto, command.postId);

        await this.commentsRepository.save(comment);
        return comment._id.toString();

    }

}

