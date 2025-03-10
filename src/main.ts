import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS
  app.enableCors();

  // PORT 환경 변수를 사용하거나 기본값으로 8080 사용
  const port = process.env.PORT || 8080;

  // 모든 네트워크 인터페이스(0.0.0.0)에서 수신 대기
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
