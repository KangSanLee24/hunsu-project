import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';

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
    origin: ['http://3.37.69.47:3000'],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['POST', 'GET'],
    credentials: true,
  });

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
    },
  });

  // PORT 실행
  await app.listen(port);
}
bootstrap();
