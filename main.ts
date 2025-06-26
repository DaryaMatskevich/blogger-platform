import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './src/setup/app.setup';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { get } from 'http';

const serverUrl = 'http://localhost:5005'
export let NODE_ENV: string;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 
  const configService = app.get(ConfigService)
  const PORT = configService.get<number>('PORT') || 5005;
  NODE_ENV = configService.get<string>('NODE_ENV', 'development');

  app.enableCors()
  appSetup(app)

  //TODO: move to configService. will be in the following lessons

  await app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
  });
}

// get the swagger json file (if app is running in development mode)
bootstrap().then(() => {
if (NODE_ENV === 'development') {

  // write swagger ui files
  get(
    `${serverUrl}/swagger/swagger-ui-bundle.js`, function
    (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
    console.log(
      `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
    );
  });

  get(`${serverUrl}/swagger/swagger-ui-init.js`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
    console.log(
      `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`,
    );
  });

  get(
    `${serverUrl}/swagger/swagger-ui-standalone-preset.js`,
    function (response) {
      response.pipe(
        createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
      );
      console.log(
        `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
      );
    });

  get(`${serverUrl}/swagger/swagger-ui.css`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
    console.log(
      `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
    );
  });

}})

;

