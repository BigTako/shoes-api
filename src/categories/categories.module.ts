import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ExtendCategoriesMiddleware } from './middlewares/extend-categories.middleware';

import { BrandMiddleware } from './middlewares/brand.middleware';
import { ModelMiddleware } from './middlewares/model.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ExtendCategoriesMiddleware)
      .forRoutes(
        { path: 'categories', method: RequestMethod.POST },
        { path: 'categories/:id', method: RequestMethod.PATCH },
      );
    consumer
      .apply(BrandMiddleware)
      .forRoutes({ path: 'categories/brand', method: RequestMethod.POST });
    consumer
      .apply(ModelMiddleware)
      .forRoutes({ path: 'categories/model', method: RequestMethod.POST });
  }
}
