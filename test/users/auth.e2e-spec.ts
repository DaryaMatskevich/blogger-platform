import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersTestManager } from '../helpers/users-test-manager';
import initSettings from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { JwtService } from '@nestjs/jwt';
import { delay } from '../helpers/delay';
import { CreateUserInputDto } from '../../src/modules/user-accounts/users/api/input-dto/users.input-dto';
import { MeViewDto } from '../../src/modules/user-accounts/users/api/view-dto/users.view-dto';
import { UserAccountsConfig } from '../../src/modules/user-accounts/user-accounts.config';
import { EmailService } from '../../src/modules/notifications/email.service';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/modules/user-accounts/users/constants/auth-tokens.inject-constants';
import { App } from 'supertest/types';

jest.setTimeout(15000);

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (userAccountsConfig: UserAccountsConfig) =>
            new JwtService({
              secret: userAccountsConfig.accessTokenSecret,
              signOptions: { expiresIn: '2m' },
            }),
          inject: [UserAccountsConfig],
        }),
    );
    app = result.app;
    usersTestManager = result.usersTestManager;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(async () => {
    if (!app) throw new Error('App not initialized');
    await deleteAllData(app);
  });

  it('should return user info via "me" with valid accessToken', async () => {
    const tokens = await usersTestManager.createAndLoginSeveralUsers(1);
    const responseBody = await usersTestManager.me(tokens[0].accessToken);
    expect(responseBody).toEqual({
      login: expect.any(String),
      userId: expect.any(String),
      email: expect.any(String),
    } as MeViewDto);
  });

  it('should return 401 for "me" when accessToken expired', async () => {
    const tokens = await usersTestManager.createAndLoginSeveralUsers(1);
    await delay(2000);
    await usersTestManager.me(tokens[0].accessToken, HttpStatus.UNAUTHORIZED);
  });

  it('should register user without actually sending email (integration test)', async () => {
    await request(app.getHttpServer())
      .post(`/auth/registration`)
      .send({
        email: 'email@email.em',
        password: '123123123',
        login: 'login123',
      } as CreateUserInputDto)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should call email sending method during registration', async () => {
    const sendEmailMethod = jest
      .spyOn(app.get(EmailService), 'sendConfirmationEmail')
      .mockImplementation(() => Promise.resolve());

    await request(app.getHttpServer())
      .post(`/auth/registration`)
      .send({
        email: 'email@email.em',
        password: '123123123',
        login: 'login123',
      } as CreateUserInputDto)
      .expect(HttpStatus.NO_CONTENT);

    expect(sendEmailMethod).toHaveBeenCalled();
    sendEmailMethod.mockRestore();
  });
});
