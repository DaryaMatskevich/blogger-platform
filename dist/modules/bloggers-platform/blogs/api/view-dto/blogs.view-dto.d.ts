import { BlogDocument } from "../../domain/dto/blog.entity";
export declare class BlogViewDto {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: Date;
    isMembership: Boolean;
    static mapToView(blog: BlogDocument): BlogViewDto;
}
