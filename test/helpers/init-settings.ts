import { CoreConfig } from '../../src/core/core.config';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { appSetup } from '../../src/setup/app.setup';
import { UsersTestManager } from './users-test-manager';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { initAppModule } from '../../src/init-app-module';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { deleteAllData } from './delete-all-data';

const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const DynamicAppModule = await initAppModule();
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();
  const coreConfig = app.get<CoreConfig>(CoreConfig);
  appSetup(app, coreConfig.isSwaggerEnabled);

  await app.init();

  const dataSource = app.get<DataSource>(getDataSourceToken());
  const httpServer = app.getHttpServer();
  const usersTestManager = new UsersTestManager(app);

  await deleteAllData(app);

  return {
    app,
    dataSource,
    httpServer,
    usersTestManager,
  };
};
export default initSettings;
