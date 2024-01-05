import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { read } from 'fs';
import { ConfigService } from '@nestjs/config';
import { CategoryTypeEnum } from '../enums/subcategory-type.enum';
import { ComparisonOperator } from '../../criterias/enums/criteria';

// executes before the request is handled by the controller
@Injectable()
export class ModelMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.body || !req.body.name) next();

    req.body.criterias = [
      {
        field: 'model',
        comparison: ComparisonOperator.MATCHES_SENSITIVE,
        value: req.body.name,
      },
    ];

    req.body.type = CategoryTypeEnum.MODEL;
    next();
  }
}
