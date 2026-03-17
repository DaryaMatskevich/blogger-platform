import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

export const configModule = ConfigModule.forRoot({
  envFilePath: [
    process.env.ENV_FILE_PATH?.trim() || '',
    join(__dirname, `env`, `.env.${process.env.NODE_ENV}.local`),
    join(__dirname, `env`, `.env.${process.env.NODE_ENV}`), // и могут быть переопределены выше стоящими файлами
    join(__dirname, `env`, '.env.production'), // сначала берутся отсюда значение
  ],
  isGlobal: true,
});
