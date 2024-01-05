import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CategoryFindOneOptions } from '../categories/categories.types';
import { Category } from '../categories/entities/category.entity';
import { CriteriasService } from '../criterias/creterias.service';
import { JoinOperator } from '../criterias/enums/criteria';
import { SheetsService } from '../sheets/sheets.service';
import { UpdateCustomDto } from './dto/update-custom.dto';
import { Custom } from './entities/custom.entity';

import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { FeautresService } from '../feautres/features.service';

// configurate cron period using env variables
const getCronInterval = () => {
  dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
  return process.env.CRON_PERIOD || '0 * * * *';
};

@Injectable()
export class CustomsService implements OnApplicationBootstrap {
  // private featuresService: FeautresService<Custom>;
  constructor(
    @InjectRepository(Custom) private repo: Repository<Custom>,
    private sheetsService: SheetsService,
    private criteriasService: CriteriasService,
    private categoriesService: CategoriesService,
    private configService: ConfigService,
  ) {}

  /**
   * This method is called when the application starts and loads
   * all customs from the google sheet(or updates it if they are in db).
   */
  async onApplicationBootstrap(): Promise<void> {
    await this.loadCustoms();
  }

  /**
   * This method is called by the cron job and loads
   * all customs from the google sheet(or updates it if they are in db).
   */
  @Cron(getCronInterval())
  async loadCustoms() {
    try {
      const dbCustoms = await this.findAll({});

      let createdCustoms: Custom[];

      if (dbCustoms.length > 0) {
        console.log('[INFO] Customs are in DB, checking updates...');
        const sheetCustoms = await this.sheetsService.getAll();

        const promises = sheetCustoms.map((custom: Custom) => {
          const dbCustom = dbCustoms.find(
            (dbCustom) => dbCustom.code === custom.code,
          );
          if (dbCustom) {
            Object.assign(dbCustom, { sizes: custom.sizes });
            return this.repo.save(dbCustom);
          } else {
            return this.repo.save(custom);
          }
        });
        createdCustoms = await Promise.all(promises);
        // check for updates
      } else {
        console.log('[INFO] No customs in DB, loading from sheet...');
        const customs = await this.sheetsService.getAll();
        const promises = customs.map((custom) => this.repo.save(custom));
        createdCustoms = await Promise.all(promises);
        // load all
      }
      return createdCustoms;
    } catch (error) {
      console.log(
        '[ERROR] Customs loading failed, check if all configurations are valid - error: ',
        error,
      );
    }
  }

  findAll(query: any) {
    return new FeautresService(
      this.configService,
      query,
      this.repo.createQueryBuilder('customs'),
      'customs',
    )
      .filter()
      .limitFields()
      .sort()
      .paginate()
      .getQueryBuilder()
      .getMany();
  }

  async findAllByCategory(where: CategoryFindOneOptions, query: any) {
    const category: Category = await this.categoriesService.findOne(where);
    // Create a query builder
    const qb = this.repo.createQueryBuilder('customs');

    // transform category creterias to query builder understadable format
    this.criteriasService.buildQuery(qb, category.criterias, JoinOperator.AND);

    return new FeautresService(this.configService, query, qb, 'customs')
      .filter()
      .limitFields()
      .sort()
      .paginate()
      .getQueryBuilder()
      .getMany();
  }

  async findOne(code: number): Promise<Custom> {
    const doc = await this.repo.findOne({
      where: { code },
    } as FindManyOptions<Custom>);

    if (!doc) {
      throw new NotFoundException('Custom not found');
    }
    return doc;
  }

  async update(code: number, updateCustomDto: UpdateCustomDto) {
    const doc = await this.findOne(code);
    Object.assign(doc, updateCustomDto); // update doc with new attrs
    return this.repo.save(doc); // save updated doc
  }

  async remove(code: number) {
    const doc = await this.findOne(code);
    return this.repo.remove(doc);
  }
}
