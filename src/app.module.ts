import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { CriteriasService } from './criterias/creterias.service';
import { CustomsModule } from './customs/customs.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { SheetsService } from './sheets/sheets.service';

import {
  dbOperatorsConfig,
  dbTypeTemplatesConfig,
  ormConfig,
} from '../config/orm.config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [ormConfig, dbOperatorsConfig, dbTypeTemplatesConfig],
      expandVariables: true,
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.get('ormConfig');
      },
      inject: [ConfigService],
    }),
    CustomsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [
    CriteriasService,
    SheetsService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        skipMissingProperties: false,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
