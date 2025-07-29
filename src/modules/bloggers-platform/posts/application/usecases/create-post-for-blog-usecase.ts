import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { BlogsQueryRepository } from "@src/modules/bloggers-platform/blogs/infastructure/query/blogs.query-repository";
import { Post, PostModelType } from "../../domain/post.entity";

import { CreatePostForBlogInputDto } from "../../api/input-dto/posts.input-dto";
import { PostsRepository } from "../../infactructure/posts.repository";

export class CreatePostForBlogCommand {
  constructor(public blogId: string, 
    public dto: CreatePostForBlogInputDto
  ) { }
}

@CommandHandler(CreatePostForBlogCommand )
export class CreatePostForBlogUseCase
  implements ICommandHandler<CreatePostForBlogCommand > {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsRepository: PostsRepository,
       @InjectModel(Post.name)
        private PostModel: PostModelType,
  ) { }

async execute(command: CreatePostForBlogCommand): Promise<string> {
          const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(command.blogId)
    
    const post = this.PostModel.createInstance({
        title: command.dto.title,
        shortDescription: command.dto.shortDescription,
        content: command.dto.content,
        blogId: command.blogId,
        blogName: blog.name,
         });
  
      await this.postsRepository.save(post);
  
      return post._id.toString();
    }
}