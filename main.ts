import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './src/setup/app.setup';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { get } from 'http';
import { join } from 'path';



// const serverUrl = 'http://localhost:5005'
// let NODE_ENV: string;
// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
 
//   const configService = app.get(ConfigService)
//   const PORT = configService.get<number>('PORT') || 5005;
//   NODE_ENV = configService.get<string>('NODE_ENV', 'development');

//   app.enableCors()
//   appSetup(app)

//   //TODO: move to configService. will be in the following lessons

//   await app.listen(PORT, () => {
//     console.log('Server is running on port ' + PORT);
//   });
// }

// // get the swagger json file (if app is running in development mode)
// bootstrap().then(() => {
// if (NODE_ENV === 'development') {

//   // write swagger ui files
//   get(
//     `${serverUrl}/swagger/swagger-ui-bundle.js`, function
//     (response) {
//     response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
//     console.log(
//       `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
//     );
//   });

//   get(`${serverUrl}/swagger/swagger-ui-init.js`, function (response) {
//     response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
//     console.log(
//       `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`,
//     );
//   });

//   get(
//     `${serverUrl}/swagger/swagger-ui-standalone-preset.js`,
//     function (response) {
//       response.pipe(
//         createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
//       );
//       console.log(
//         `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
//       );
//     });

//   get(`${serverUrl}/swagger/swagger-ui.css`, function (response) {
//     response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
//     console.log(
//       `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
//     );
//   });

// }})

// ;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 5005; // Vercel использует 3000 по умолчанию
  const NODE_ENV = configService.get<string>('NODE_ENV', 'development');

  // Важно для Vercel
  app.setGlobalPrefix('api');
  
  app.enableCors();
  appSetup(app);

  const server = await app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
  });

  // Swagger только в development
  if (NODE_ENV === 'development') {
    downloadSwaggerAssets(PORT);
  }

  // Для Serverless-функции Vercel
  return server;
}

// Функция для загрузки Swagger ассетов
function downloadSwaggerAssets(port: number) {
  const serverUrl = `http://localhost:${port}`;
  const swaggerDir = join(process.cwd(), 'swagger-static');
  
  // Создаем директорию, если не существует
  try {
    require('fs').mkdirSync(swaggerDir, { recursive: true });
  } catch (err) {
    console.error('Error creating swagger-static directory:', err);
  }

  const assets = [
    { path: '/swagger/swagger-ui-bundle.js', file: 'swagger-ui-bundle.js' },
    { path: '/swagger/swagger-ui-init.js', file: 'swagger-ui-init.js' },
    { path: '/swagger/swagger-ui-standalone-preset.js', file: 'swagger-ui-standalone-preset.js' },
    { path: '/swagger/swagger-ui.css', file: 'swagger-ui.css' },
  ];

  assets.forEach(({ path, file }) => {
    get(`${serverUrl}${path}`, (response) => {
      const filePath = join(swaggerDir, file);
      response.pipe(createWriteStream(filePath))
        .on('finish', () => console.log(`Swagger file written to: ${filePath}`))
        .on('error', (err) => console.error(`Error writing ${filePath}:`, err));
    }).on('error', (err) => console.error(`Error downloading ${path}:`, err));
  });
}

// Экспорт для Vercel Serverless
export default bootstrap().then(app => app.getHttpAdapter().getInstance());
