import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: 'cxm',
      resave: false, // 是否重新保存session
      saveUninitialized: false, // 是否保存未初始化的session
    }),
  );
  await app.listen(3000);
}
bootstrap();
