import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { Matches } from 'class-validator';
import { BLOG } from '../../../../../modules/bloggers-platform/blogs/constants/blog.constants';

export class BlogInputDto {
  @IsStringWithTrim(BLOG.NAME.MIN, BLOG.NAME.MAX)
  name: string;

  @IsStringWithTrim(BLOG.DESCRIPTION.MIN, BLOG.DESCRIPTION.MAX)
  description: string;

  @IsStringWithTrim(BLOG.WEBSITE_URL.MIN, BLOG.WEBSITE_URL.MAX)
  @Matches(BLOG.WEBSITE_URL.URL_PATTERN, {
    message: 'URL должен начинаться с https://',
  })
  websiteUrl: string;
}
