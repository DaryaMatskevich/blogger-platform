import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersTestManager } from '../helpers/users-test-manager';
import initSettings from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInputDto } from '../../src/modules/user-accounts/users/api/input-dto/users.input-dto';
import { UserViewDto } from '../../src/modules/user-accounts/users/api/view-dto/users.view-dto';
import { UserAccountsConfig } from '../../src/modules/user-accounts/user-accounts.config';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view.dto';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/modules/user-accounts/users/constants/auth-tokens.inject-constants';
import { App } from 'supertest/types';

jest.setTimeout(15000);

describe('users (e2e)', () => {
  let app: INestApplication<App>;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (userAccountsConfig: UserAccountsConfig) => {
            return new JwtService({
              secret: userAccountsConfig.accessTokenSecret,
              signOptions: { expiresIn: '2s' },
            });
          },
          inject: [UserAccountsConfig],
        }),
    );
    app = result.app;
    usersTestManager = result.usersTestManager;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    if (!app) throw new Error('App not initialized');
    await deleteAllData(app);
  });

  it('should create user', async () => {
    const body: CreateUserInputDto = {
      login: 'name1',
      password: 'qwert23',
      email: 'dashy16@mail.com',
    };

    const response = await usersTestManager.createUser(body);

    expect(response).toEqual({
      id: expect.any(String),
      login: body.login,
      email: body.email,
      createdAt: expect.any(String),
    });
  });

  it('should get users with pagination', async () => {
    const users = await usersTestManager.createSeveralUsers(12);

    const { body: responseBody } = (await request(app.getHttpServer())
      .get(`/sa/users?pageNumber=2&sortDirection=asc`)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.OK)) as { body: PaginatedViewDto<UserViewDto> };

    expect(responseBody.totalCount).toBe(12);
    expect(responseBody.items).toHaveLength(2);
    expect(responseBody.pagesCount).toBe(2);
    //asc sorting
    expect(responseBody.items[1]).toEqual(users[users.length - 1]);
  });

  it('should delete user by admin', async () => {
    const user = await usersTestManager.createUser({
      login: 'todeletet',
      password: 'pass1234',
      email: 'dashy16@mail.ru',
    });

    await request(app.getHttpServer())
      .delete(`/sa/users/${user.id}`)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .get('/sa/users')
      .auth('admin', 'qwerty')
      .expect(HttpStatus.OK);

    const usersAfter = response.body as PaginatedViewDto<UserViewDto[]>;
    const deletedUser = usersAfter.items.find(
      (u: UserViewDto) => u.id === user.id,
    );
    expect(deletedUser).toBeUndefined();
  });
});
