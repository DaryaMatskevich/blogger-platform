declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    MONGO_URL: string;
    // добавьте свои переменные здесь
  }
}