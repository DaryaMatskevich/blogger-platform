import { BlogDocument } from "../../../domain/dto/blog.entity";
export declare class BlogExternalDto {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: Date;
    isMembership: Boolean;
    static mapToView(blog: BlogDocument): BlogExternalDto;
}
