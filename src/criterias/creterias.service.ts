import { Injectable } from '@nestjs/common';
import { Brackets, WhereExpressionBuilder } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { DbTypeTemplate } from '../feautres/features';
import { FeautresService } from '../feautres/features.service';
import { Criterias } from './dtos/criterias.dto';
import { JoinOperator } from './enums/criteria';

@Injectable()
export class CriteriasService {
  private dbOperators: object;
  private dbTypeTemplates: DbTypeTemplate;

  constructor(private configService: ConfigService) {
    this.dbOperators = this.configService.get<object>('dbOperators');
    this.dbTypeTemplates =
      this.configService.get<DbTypeTemplate>('dbTypeTemplates');
  }
  /**
   * Converts criteriass object to FindConditions object to be used in TypeORM query
   * Use it by passing gerenated object as value to where: conditions object.
   * @param qb: WhereExpressionBuilder - TypeORM query builder
   * @param criterias criteriass object to be converted to query
   * @param operator - AND or OR SQL operator to be used to join criteriass
   * @returns FindConditions object to be used in TypeORM query
   */
  buildQuery(
    qb: WhereExpressionBuilder,
    criterias: Criterias,
    operator: JoinOperator = JoinOperator.AND,
  ): WhereExpressionBuilder {
    for (const condition of criterias) {
      if ('operator' in condition) {
        // create set of conditions which will be joined by same operator
        const brackets = new Brackets((qbInner) => {
          this.buildQuery(qbInner, condition.conditions, condition.operator);
        });

        if (operator === JoinOperator.OR) {
          qb.orWhere(brackets);
        } else if (operator === JoinOperator.AND) {
          qb.andWhere(brackets);
        }
      } else if ('field' in condition) {
        const { dbQuery, parameter } = FeautresService.transformQuery(
          condition.field,
          { [condition.comparison]: condition.value },
          this.dbOperators,
          this.dbTypeTemplates,
        );

        if (operator === JoinOperator.OR) {
          qb.orWhere(dbQuery, parameter);
        } else if (operator === JoinOperator.AND) {
          qb.andWhere(dbQuery, parameter);
        }
      }
    }

    return qb;
  }
}
