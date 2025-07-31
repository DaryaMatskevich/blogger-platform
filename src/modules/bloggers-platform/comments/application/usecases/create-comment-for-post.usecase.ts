import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { CreateCommentInputDto } from "../../api/input-dto.ts/comment.input-dto";
import { Comment, CommentModelType } from "../../domain/comment.entity";
import { CommentsRepository } from "../../infrastructute/comments.repository";
import { PostsRepository } from "../../../../../modules/bloggers-platform/posts/infactructure/posts.repository";
import { UsersRepository } from "../../../../../modules/user-accounts/infastructure/users.repository";

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
        private commentsRepository: CommentsRepository,
        private usersRepository: UsersRepository,
        private postsRepository: PostsRepository,
        @InjectModel(Comment.name)
        private commentModel: CommentModelType,
    ) { }

    async execute(command: CreateCommentForPostCommand): Promise<string> {
        const post = await this.postsRepository.findOrNotFoundFail(command.postId)
const user = await this.usersRepository.findOrNotFoundFail(command.userId)
const commentDto = {
     content: command.dto.content,
        commentatorInfo: {
            userId: user._id.toString(),
            userLogin: user.login
        }
}
        const comment = this.commentModel.createInstance(commentDto);

        await this.commentsRepository.save(comment);

        return comment._id.toString();
    }
}