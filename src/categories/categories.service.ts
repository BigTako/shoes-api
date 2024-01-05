import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

import { CreateCategoryDto } from './dto/create-category.dto';

import { ConfigService } from '@nestjs/config';
import { FeautresQuery } from '../feautres/features';
import { FeautresService } from '../feautres/features.service';
import { CategoryFindOneOptions } from './categories.types';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private repo: Repository<Category>,
    private configService: ConfigService,
  ) {}

  findAll(query: FeautresQuery) {
    return new FeautresService(
      this.configService,
      query,
      this.repo.createQueryBuilder('categories'),
      'categories',
    )
      .filter()
      .limitFields()
      .sort()
      .paginate()
      .getQueryBuilder()
      .getMany();
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.repo.create(createCategoryDto);
    await this.repo.save(category);
    return category;
  }

  async findOne(where: CategoryFindOneOptions) {
    const category = await this.repo.findOne({
      where,
    } as FindOneOptions<Category>);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: number, updateCustomDto: UpdateCategoryDto) {
    const doc = await this.findOne({ id });
    Object.assign(doc, updateCustomDto); // update doc with new attrs
    return this.repo.save(doc); // save updated doc
  }

  async remove(id: number) {
    const doc = await this.findOne({ id });
    return this.repo.remove(doc);
  }
}
