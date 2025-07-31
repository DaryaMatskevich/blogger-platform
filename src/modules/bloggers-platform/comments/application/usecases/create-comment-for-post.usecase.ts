import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { CreateCommentInputDto } from "../../api/input-dto.ts/comment.input-dto";
import { Comment, CommentModelType } from "../../domain/comment.entity";
import { CommentsRepository } from "../../infrastructute/comments.repository";
import { PostsRepository } from "../../../../../modules/bloggers-platform/posts/infactructure/posts.repository";
import { UsersExternalQueryRepository } from "../.../../../../../../modules/user-accounts/infastructure/external-query/external-dto/users.external-query-repository";

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
        private postsRepository: PostsRepository,
       
    ) { }

    async execute(command: CreateCommentForPostCommand): Promise<string> {
        const post = await this.postsRepository.findOrNotFoundFail(command.postId)
const user = await this.usersExternalQueryRepository.getByIdOrNotFoundFail(command.userId)
const commentDto = {
     content: command.dto.content,
        commentatorInfo: {
            userId: user.id,
            userLogin: user.login
        }
}
        const comment = this.commentModel.createInstance(commentDto);

        await this.commentsRepository.save(comment);

        return comment._id.toString();
    }
}