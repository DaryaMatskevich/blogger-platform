// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { PostsRepository } from '../../infactructure/posts.repository';
// import { CreatePostInputDto } from '../../api/input-dto/posts.input-dto';
// import { BlogsRepository } from '../../../../../modules/bloggers-platform/blogs/infastructure/blogs.repository';
//
// export class CreatePostCommand {
//   constructor(public dto: CreatePostInputDto) {}
// }
//
// @CommandHandler(CreatePostCommand)
// export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
//   constructor(
//     private postsRepository: PostsRepository,
//     private blogsRepository: BlogsRepository,
//   ) {}
//
//   async execute(command: CreatePostCommand) {
//     const blogId = parseInt(command.dto.blogId, 10);
//
//     const blog = await this.blogsRepository.findOrNotFoundFail(blogId);
//
//     const post = this.PostModel.createInstance({
//       title: command.dto.title,
//       shortDescription: command.dto.shortDescription,
//       content: command.dto.content,
//       blogId: command.dto.blogId,
//       blogName: blog.name,
//     });
//
//     await this.postsRepository.save(post);
//
//     return post._id.toString();
//   }
// }
