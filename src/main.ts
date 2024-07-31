import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:5500',
      'https://nid.naver.com/oauth2.0/*',
    ], // 허용할 도메인
    credentials: true, // 인증 정보 허용
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
