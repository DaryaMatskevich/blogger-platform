import { BlogViewDto } from './view-dto/blogs.view-dto';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infastructure/query/blogs.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { CreatePostForBlogInputDto } from '../../posts/api/input-dto/posts.input-dto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infactructure/query/posts.query-repository';
export declare class BlogsController {
    private blogsService;
    private postsService;
    private blogsQueryRepository;
    private postsQueryRepository;
    constructor(blogsService: BlogsService, postsService: PostsService, blogsQueryRepository: BlogsQueryRepository, postsQueryRepository: PostsQueryRepository);
    getById(id: string): Promise<BlogViewDto>;
    getAll(query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>>;
    createBlog(body: CreateBlogInputDto): Promise<BlogViewDto>;
    updateBlog(id: string, body: UpdateBlogInputDto): Promise<BlogViewDto>;
    deleteBlog(id: string): Promise<void>;
    getAllPostsForBlog(id: string, query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>>;
    createPostForBlog(blogId: string, body: CreatePostForBlogInputDto): Promise<PostViewDto>;
}
