import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { POST } from '../../../../../modules/bloggers-platform/posts/constants/post.constants';

export class PostInputDto {
  @IsStringWithTrim(POST.TITLE.MIN, POST.TITLE.MAX)
  title: string;

  @IsStringWithTrim(POST.SHORT_DESCRIPTION.MIN, POST.SHORT_DESCRIPTION.MAX)
  shortDescription: string;

  @IsStringWithTrim(POST.CONTENT.MIN, POST.CONTENT.MAX)
  content: string;
}
