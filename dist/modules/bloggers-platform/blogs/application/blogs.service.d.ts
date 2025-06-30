import { BlogModelType } from '../domain/dto/blog.entity';
import { BlogsRepository } from '../infastructure/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
export declare class BlogsService {
    private BlogModel;
    private blogsRepository;
    constructor(BlogModel: BlogModelType, blogsRepository: BlogsRepository);
    createBlog(dto: CreateBlogDto): Promise<string>;
    updateBlog(id: string, dto: UpdateBlogDto): Promise<string>;
    deleteBlog(id: string): Promise<void>;
}
