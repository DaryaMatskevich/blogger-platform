import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatePostDto } from "../../api/input-dto/posts.update-input.dto";
import { PostsRepository } from "../../infactructure/posts.repository";

export class UpdatePostCommand {
    constructor(public postId: string,
        public dto: UpdatePostDto
    ) { }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
    implements ICommandHandler<UpdatePostCommand> {
    constructor(
        private postsRepository: PostsRepository,
    ) { }

    async execute(command: UpdatePostCommand): Promise<string> {
        const post = await this.postsRepository.findOrNotFoundFail(command.postId);

        // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
        // создаём метод
        post.update(command.dto); // change detection

        await this.postsRepository.save(post);

        return post._id.toString();
    }
}