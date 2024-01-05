import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CategoryTypeEnum } from '../categories/enums/subcategory-type.enum';
import { CustomsService } from './customs.service';
import { UpdateCustomDto } from './dto/update-custom.dto';
import { FeautresQuery } from '../feautres/features';

@Controller('customs')
export class CustomsController {
  constructor(private readonly customsService: CustomsService) {}

  @Get()
  findAll(@Query() query: FeautresQuery) {
    return this.customsService.findAll(query);
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.customsService.findOne(+code);
  }

  @Patch(':code')
  update(
    @Param('code') code: string,
    @Body() updateCustomDto: UpdateCustomDto,
  ) {
    return this.customsService.update(+code, updateCustomDto);
  }

  @Get('category/:id')
  getCustomsByCategory(@Query() query: Object, @Param('id') id: string) {
    return this.customsService.findAllByCategory({ id: +id }, query);
  }

  @Get('category/name/:name')
  getCustomsByCategoryName(
    @Query() query: FeautresQuery,
    @Param('name') name: string,
  ) {
    return this.customsService.findAllByCategory({ name }, query);
  }

  @Get('brand/:name')
  getCustomsByBrand(
    @Query() query: FeautresQuery,
    @Param('name') name: string,
  ) {
    return this.customsService.findAllByCategory(
      {
        name,
        type: CategoryTypeEnum.BRAND,
      },
      query,
    );
  }

  @Get('model/:name')
  getCustomsByModel(
    @Query() query: FeautresQuery,
    @Param('name') name: string,
  ) {
    return this.customsService.findAllByCategory(
      {
        name,
        type: CategoryTypeEnum.MODEL,
      },
      query,
    );
  }
}
