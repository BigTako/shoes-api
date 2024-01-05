import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { CriteriasService } from '../criterias/creterias.service';
import { SheetsService } from '../sheets/sheets.service';
import { CustomsController } from './customs.controller';
import { CustomsService } from './customs.service';
import { Custom } from './entities/custom.entity';

@Module({
  imports: [CategoriesModule, TypeOrmModule.forFeature([Custom])],
  controllers: [CustomsController],
  providers: [CustomsService, SheetsService, CriteriasService],
})
export class CustomsModule {}
