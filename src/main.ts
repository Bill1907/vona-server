import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    console.log('Starting application...');

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Enable validation globally
    app.useGlobalPipes(new ValidationPipe());

    // Enable CORS
    app.enableCors();

    // PORT 환경 변수를 사용하거나 기본값으로 8080 사용
    const port = process.env.PORT || 8080;

    console.log(`Attempting to listen on port ${port}...`);

    // 모든 네트워크 인터페이스(0.0.0.0)에서 수신 대기
    await app.listen(port, '0.0.0.0');

    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// 처리되지 않은 예외 및 거부 처리
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 애플리케이션을 종료하지 않지만 로그는 남김
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();
