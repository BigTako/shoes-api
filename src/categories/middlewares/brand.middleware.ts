import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CategoryTypeEnum } from '../enums/subcategory-type.enum';
import {
  ComparisonOperator,
  JoinOperator,
} from '../../criterias/enums/criteria';

// executed before the request is handled by the controller
@Injectable()
export class BrandMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.body || !req.body.name) next();

    req.body.criterias = [
      {
        operator: JoinOperator.OR,
        conditions: [
          {
            field: 'model',
            comparison: ComparisonOperator.MATCHES_SENSITIVE,
            value: req.body.name,
          },
          {
            field: 'name',
            comparison: ComparisonOperator.MATCHES_INSENSITIVE,
            value: req.body.name,
          },
        ],
      },
    ];
    req.body.type = CategoryTypeEnum.BRAND;
    next();
  }
}
