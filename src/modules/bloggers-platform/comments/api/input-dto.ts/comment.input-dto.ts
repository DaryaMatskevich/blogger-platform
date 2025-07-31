import { IsStringWithTrim } from "../../../../../core/decorators/validation/is-string-with-trim";
import { contentConstraints } from "../../domain/comment.entity";

export class CreateCommentInputDto {
   @IsStringWithTrim(contentConstraints.minLength, contentConstraints.maxLength)
    content: string
}