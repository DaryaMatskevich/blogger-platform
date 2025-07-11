import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { createWriteStream } from 'fs';
import { get } from 'http'; 



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

  if (process.env.NODE_ENV === 'development') {

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
   }
   }

 bootstrap();

