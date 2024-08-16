import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // PayloadTooLargeError 오류로 body를 10mb까지 받을 수 있게 수정.
  app.use(json({ limit: '10mb' }));
  // Configuration 이용해서 .env 활용
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT');

  app.setGlobalPrefix('api', { exclude: ['health-check'] });

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['POST', 'GET'],
    credentials: true,
  });

  // 정적 파일 제공 설정
  app.use(
    express.static(join(__dirname, '..', 'front', 'html'), {
      extensions: ['html', 'htm'], // .html 파일을 확장자로 추가
    })
  );

  // Swagger 문서 준비
  const config = new DocumentBuilder()
    .setTitle('p6-hunsu-project')
    .setDescription('hunsu')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  // Swagger 세팅
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
    },
  });

  // PORT 실행
  await app.listen(port);
}
bootstrap();
