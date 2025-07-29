import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBlogDto } from "../../dto/create-blog.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogModelType } from "../../domain/dto/blog.entity";
import { BlogsRepository } from "../../infastructure/blogs.repository";

export class CreateBlogCommand {
    constructor(public dto: CreateBlogDto
    ) { }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
    implements ICommandHandler<CreateBlogCommand> {
    constructor(
        private blogsRepository: BlogsRepository,
         @InjectModel(Blog.name)
            private BlogModel: BlogModelType,
    ) { }

async execute(command: CreateBlogCommand): Promise<string> {
    const blog = this.BlogModel.createInstance({
      name: command.dto.name,
      description: command.dto.description,
      websiteUrl: command.dto.websiteUrl
    });

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }
}