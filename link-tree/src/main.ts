import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.useStaticAssets(
    join(__dirname, '..', 'profile-images'),
  );

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  const config = app.get(ConfigService);

  const sessionDuration = config.get('SESSION_DURATION');
  const sessionSecret = config.get('SESSION_SECRET');

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: sessionDuration },
    }),
  );

  await app.listen(3333);
}

bootstrap();
