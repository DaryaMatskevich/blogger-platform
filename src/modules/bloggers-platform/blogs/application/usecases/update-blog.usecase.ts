import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../infastructure/blogs.repository";
import { UpdateBlogDto } from "../../dto/update-blog.dto";

export class UpdateBlogCommand {
    constructor(public id: string,
        public dto: UpdateBlogDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
    implements ICommandHandler<UpdateBlogCommand> {
    constructor(
        private blogsRepository: BlogsRepository,
    ) { }


    async execute(command: UpdateBlogCommand): Promise<string> {
        const blog = await this.blogsRepository.findOrNotFoundFail(command.id);

        // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
        // создаём метод
        blog.update(command.dto); // change detection

        await this.blogsRepository.save(blog);

        return blog._id.toString();
    }
}