import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import initSettings from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { BlogInputDto } from '../../src/modules/sa/sa.blogs/api/dto/blogs.input-dto';
import { PostInputDto } from '../../src/modules/bloggers-platform/posts/api/input-dto/posts.input-dto';
import { BlogViewDto } from '@src/modules/bloggers-platform/blogs/api/view-dto/blogs.view-dto';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('GET /blogs', () => {
    it('should return empty list when no blogs exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/blogs')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return paginated blogs', async () => {
      // Создаем 5 блогов через админку
      const blogs: BlogViewDto[] = [];
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .post('/sa/blogs')
          .auth('admin', 'qwerty')
          .send({
            name: `Blog ${i}`,
            description: `Description ${i}`,
            websiteUrl: `https://blog${i}.example.com`,
          } as BlogInputDto)
          .expect(HttpStatus.CREATED);
        blogs.push(response.body as BlogViewDto);
      }

      // Запрос page=1, pageSize=3
      const response = await request(app.getHttpServer())
        .get('/blogs?pageSize=3&page=1')
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        pagesCount: 2,
        page: 1,
        pageSize: 3,
        totalCount: 5,
        items: expect.any(Array),
      });
      expect(response.body.items).toHaveLength(3);
    });

    it('should filter blogs by searchNameTerm', async () => {
      // Создаем блоги с разными именами
      await request(app.getHttpServer())
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send({
          name: 'Javascript News',
          description: 'desc1',
          websiteUrl: 'https://js.com',
        });

      await request(app.getHttpServer())
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send({
          name: 'TypeScript Tips',
          description: 'desc2',
          websiteUrl: 'https://ts.com',
        });

      const response = await request(app.getHttpServer())
        .get('/blogs?searchNameTerm=java')
        .expect(HttpStatus.OK);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Javascript News');
    });

    it('should sort blogs by name descending', async () => {
      await request(app.getHttpServer())
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send({
          name: 'Alpha',
          description: 'desc',
          websiteUrl: 'https://alpha.com',
        });

      await request(app.getHttpServer())
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send({
          name: 'Beta',
          description: 'desc',
          websiteUrl: 'https://beta.com',
        });

      const response = await request(app.getHttpServer())
        .get('/blogs?sortBy=name&sortDirection=desc')
        .expect(HttpStatus.OK);

      const names = response.body.items.map((b) => b.name);
      expect(names).toEqual(['Beta', 'Alpha']);
    });
  });

  describe('GET /blogs/:id', () => {
    it('should return existing blog', async () => {
      const created = await request(app.getHttpServer())
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send({
          name: 'Test Blog',
          description: 'Test description',
          websiteUrl: 'https://test.com',
        })
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get(`/blogs/${created.body.id}`)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: created.body.id,
        name: 'Test Blog',
        description: 'Test description',
        websiteUrl: 'https://test.com',
      });
    });

    it('should return 404 when blog not found', async () => {
      await request(app.getHttpServer())
        .get('/blogs/15')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for non-numeric id', async () => {
      await request(app.getHttpServer())
        .get('/blogs/abc')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /blogs/:id/posts', () => {
    let blogId: number;

    beforeEach(async () => {
      // Создаем блог для тестов
      const blog = await request(app.getHttpServer())
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send({
          name: 'Post Test Blog',
          description: 'Desc',
          websiteUrl: 'https://postblog.com',
        })
        .expect(HttpStatus.CREATED);
      blogId = blog.body.id;

      // Создаем 4 поста в этом блоге
      for (let i = 1; i <= 5; i++) {
        await request(app.getHttpServer())
          .post(`/sa/blogs/${blogId}/posts`)
          .auth('admin', 'qwerty')
          .send({
            title: `Post ${i}`,
            shortDescription: `Short ${i}`,
            content: `Content ${i}`,
          } as PostInputDto)
          .expect(HttpStatus.CREATED);
      }
    });

    it('should return posts for specific blog', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blogs/${blogId}/posts?pageSize=2`)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        pagesCount: 3,
        page: 1,
        pageSize: 2,
        totalCount: 5,
        items: expect.any(Array),
      });
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0]).toHaveProperty('blogId', blogId);
    });

    it('should return 404 when blog does not exist', async () => {
      await request(app.getHttpServer())
        .get('/blogs/15/posts')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should sort posts by createdAt in descending order by default', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blogs/${blogId}/posts`)
        .expect(HttpStatus.OK);

      // Предполагаем, что создано 5 постов с разными createdAt
      expect(response.body.items).toHaveLength(5);
      const titles = response.body.items.map((p) => p.title);
      // Так как default sortDirection = Desc, последний созданный будет первым
      expect(titles).toEqual([
        'Post 5',
        'Post 4',
        'Post 3',
        'Post 2',
        'Post 1',
      ]);
    });

    it('should sort posts by createdAt in ascending order when sortDirection=asc', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blogs/${blogId}/posts?sortDirection=asc`)
        .expect(HttpStatus.OK);

      const titles = response.body.items.map((p) => p.title);
      expect(titles).toEqual([
        'Post 1',
        'Post 2',
        'Post 3',
        'Post 4',
        'Post 5',
      ]);
    });

    it('should sort posts by createdAt descending by default', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blogs/${blogId}/posts?sortBy=createdAt&sortDirection=desc`)
        .expect(HttpStatus.OK);

      const titles = response.body.items.map((p) => p.title);
      // Посты создавались от 0 до 3, последний создан последним -> desc даст "Post 3", "Post 2", ...
      expect(titles).toEqual([
        'Post 5',
        'Post 4',
        'Post 3',
        'Post 2',
        'Post 1',
      ]);
    });
  });
});
