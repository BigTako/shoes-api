import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from '../categories.service';
import { Category } from '../entities/category.entity';
import { Criterias } from '../../criterias/dtos/criterias.dto';

// executed before the request is handled by the controller
@Injectable()
export class ExtendCategoriesMiddleware implements NestMiddleware {
  constructor(private categoryService: CategoriesService) {}

  private async replaceExtendsWithAnd(
    conditions: Criterias,
  ): Promise<Criterias> {
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      if ('operator' in condition) {
        // criteria is join operator
        // condition is a CriteriaOperator
        condition.conditions = await this.replaceExtendsWithAnd(
          condition.conditions,
        );
      } else if ('category' in condition) {
        // criteria is category extendor
        const name = condition.category;

        const category = (await this.categoryService
          .findOne({
            name,
            type: condition.type,
          })
          .catch((err) => {
            if (err.status === 404) {
              throw new NotFoundException(
                `Category not found by field: ${name}`,
              );
            }
          })) as Category;

        conditions.splice(i--, 1); // replace extendor with its criterias

        conditions.push(...category.criterias);
      }
    }
    return conditions;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.body.criterias)
      req.body.criterias = await this.replaceExtendsWithAnd(req.body.criterias);
    next();
  }
}
