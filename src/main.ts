import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import * as express from 'express';
import { join } from 'path';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import * as Sentry from '@sentry/node';
import { RedisService } from './redis/redis.service';
import { RedisIoAdapter } from './redis-io.adapter/redis-io.adapter';
import { winstonLogger } from './configs/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: winstonLogger, // 윈스턴 로거로 대체
  });

  // PayloadTooLargeError 오류로 body를 10mb까지 받을 수 있게 수정.
  app.use(json({ limit: '10mb' }));
  // Configuration 이용해서 .env 활용
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT');
  // 센트리 초기화 설정
  Sentry.init({
    dsn: configService.get<string>('SENTRY_DSN'),
    integrations: [
      nodeProfilingIntegration(), // 프로파일링 통합 추가
    ],
    tracesSampleRate: 1.0, // 100%의 트랜잭션을 캡처
    profilesSampleRate: 1.0, // 100%의 프로파일링 데이터를 수집
  });

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

  app.enableShutdownHooks(); // 애플리케이션 종료 시 cleanup을 위해 활성화

  // 모든 모듈이 초기화된 후 실행
  await app.listen(port, async () => {
    console.log('Application is running on: 3000');

    // RedisService가 완전히 초기화된 후 RedisIoAdapter 초기화
    const redisService = app.get(RedisService);
    const redisIoAdapter = new RedisIoAdapter(app, redisService);
    await redisIoAdapter.connectToRedis();

    // redis 어댑터를 websocket에 적용
    app.useWebSocketAdapter(redisIoAdapter);

    console.log('WebSocket adapter is set up.');
  });
}
bootstrap();
