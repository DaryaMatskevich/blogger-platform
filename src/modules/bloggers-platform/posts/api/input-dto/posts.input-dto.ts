//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreatePostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
 }