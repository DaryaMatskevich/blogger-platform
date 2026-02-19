import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { Matches } from 'class-validator';
import { BLOG } from '../../../../../modules/bloggers-platform/blogs/constants/blog.constants';

export class BlogInputDto {
  @IsStringWithTrim(BLOG.NAME_MIN, BLOG.NAME_MAX)
  name: string;

  @IsStringWithTrim(BLOG.DESC_MIN, BLOG.DESC_MAX)
  description: string;

  @IsStringWithTrim(BLOG.URL_MIN, BLOG.URL_MAX)
  @Matches(BLOG.URL_PATTERN, {
    message: 'URL должен начинаться с https://',
  })
  websiteUrl: string;
}
