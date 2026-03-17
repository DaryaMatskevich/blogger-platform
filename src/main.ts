import { appSetup } from './setup/app.setup';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { initAppModule } from './init-app-module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  const dynamicAppModule = await initAppModule();
  // создаём на основе донастроенного модуля наше приложение
  const app = await NestFactory.create(dynamicAppModule);

  // Получаем Express instance и настраиваем
  const expressInstance = app.getHttpAdapter().getInstance();

  if (expressInstance && typeof expressInstance.set === 'function') {
    expressInstance.set('trust proxy', 'loopback');
  }

  const coreConfig = app.get(CoreConfig);

  app.enableCors();
  appSetup(app, coreConfig.isSwaggerEnabled);
  app.use(cookieParser());

  if (coreConfig.isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('it-incubator Configuration example')
      .setDescription('The API description')
      .setVersion('1.0')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
  }

  await app.listen(coreConfig.port);
  console.log('Server is running on port ' + coreConfig.port);
}
bootstrap();
