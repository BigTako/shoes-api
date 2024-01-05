import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFindOneOptions } from './categories.types';
import { FeautresQuery } from '../feautres/features';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query() query: FeautresQuery) {
    return this.categoriesService.findAll(query);
  }

  @Post('brand')
  createBrand(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body);
  }

  @Post('model')
  createModel(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body);
  }

  @Get('name/:name')
  findOneByName(@Param('name') name: string) {
    return this.categoriesService.findOne({ name } as CategoryFindOneOptions);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne({ id: +id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
