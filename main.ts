import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './src/setup/app.setup';
import { createWriteStream } from 'fs';
import { get } from 'http';
import { resolve } from 'path';
import { writeFileSync } from 'fs';


const port = process.env.PORT || 5005;
const serverUrl = 'http://localhost:5005'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  appSetup(app)

  //TODO: move to configService. will be in the following lessons

await app.listen(port, () => {
    console.log('Server is running on port ' + port);
  });

//   

if (process.env.NODE_ENV === 'development') {
    const pathToSwaggerStaticFolder = resolve(process.cwd(), 'swagger-static');

    // write swagger json file
    const pathToSwaggerJson = resolve(
      pathToSwaggerStaticFolder,
      'swagger.json',
    );
    const swaggerJson = JSON.stringify(document, null, 2);
    writeFileSync(pathToSwaggerJson, swaggerJson);
    console.log(`Swagger JSON file written to: '/swagger-static/swagger.json'`);
  }
}

bootstrap();
