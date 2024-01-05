import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('api/v1');

  const configService = app.get(ConfigService);
  app.use(helmet());
  app.use(compression());

  await app.listen(configService.get<number>('PORT') || 3000);
}
bootstrap();
