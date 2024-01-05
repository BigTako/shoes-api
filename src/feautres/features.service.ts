import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { SelectQueryBuilder } from 'typeorm';
import { ComparisonOperator, JoinOperator } from '../criterias/enums/criteria';
import { DbTypeTemplate, FeautresQuery } from './features';

/**
 * Class for manipulating GET results. Supports filtering, sorting, pagination and limiting fields.
 */
export class FeautresService<T> {
  private dbOperators: object;
  private dbTypeTemplates: DbTypeTemplate;
  /**
   * Class constructor
   * @param {*} queryBuilder - query builder object of createBuilderQuery() method
   * @param {*} requestQuery - query passed as request query
   * @param {*} tableName - name of the table to be used in query
   * @param {*} configService - config service
   */
  constructor(
    private configService: ConfigService,
    private requestQuery: FeautresQuery,
    private queryBuilder: SelectQueryBuilder<T>,
    private tableName: string,
  ) {
    this.dbOperators = this.configService.get<object>('dbOperators');
    this.dbTypeTemplates =
      this.configService.get<DbTypeTemplate>('dbTypeTemplates');
  }
  /**
   * Transforms request query to TypeORM query and chains it
   */
  static transformQuery(
    field: string,
    processedValue: string | object,
    dbOperators: Object,
    dbTypeTemplates: DbTypeTemplate,
  ) {
    let value: string;
    let operator: string;

    // if value is string, then it is equal to field
    if (typeof processedValue === 'string') {
      operator = ComparisonOperator.EQ;
      value = processedValue;
    } else if (typeof processedValue === 'object') {
      operator = Object.keys(processedValue)[0];
      value = processedValue[operator];
    }

    const queryOperator = dbOperators[operator];

    // transform value to db specific value type
    if (
      operator === ComparisonOperator.CONTAIN_ALL ||
      operator === ComparisonOperator.CONTAINED_BY
    ) {
      value = dbTypeTemplates.array.replace('<VALUE>', value.toString());
    } else if (
      operator === ComparisonOperator.MATCHES_INSENSITIVE ||
      operator === ComparisonOperator.MATCHES_SENSITIVE
    ) {
      value = dbTypeTemplates.stringMatches.replace(
        '<VALUE>',
        value.toString(),
      );
    }

    // make parameter key unique in order to avoid collisions
    let parameterKey = `${randomBytes(8).toString(
      'hex',
    )}.${field}.${operator}.${value}`.replace(/[^a-zA-Z0-9_.]/g, '_');

    const parameter = { [parameterKey]: value };

    const dbQuery = `${field} ${queryOperator} :${parameterKey}`;

    return { dbQuery, parameter };
  }

  /**
   * Injects where queries to query builder
   * @param query - request query
   * @param joinOperator - AND or OR SQL operator to be used to join criterias
   */
  private injectWhereQueries(
    query: Object,
    joinOperator: JoinOperator = JoinOperator.AND,
  ) {
    for (const [key, processedValue] of Object.entries(query)) {
      const { dbQuery, parameter } = FeautresService.transformQuery(
        key,
        processedValue,
        this.dbOperators,
        this.dbTypeTemplates,
      );

      if (joinOperator === JoinOperator.AND) {
        this.queryBuilder.andWhere(dbQuery, parameter);
      } else if (joinOperator === JoinOperator.OR) {
        this.queryBuilder.orWhere(dbQuery, parameter);
      }
    }
  }
  /**
   * Filter - get only objects which fields satisfy
   * given criteria.
   * Ex.: price[gte|gt|lte|lt]=2
   * @returns this
   */
  filter() {
    const queryObj = { ...this.requestQuery };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    this.injectWhereQueries(queryObj);

    return this;
  }

  /**
   * Define what fields should be selected in each output object.
   * Ex.: fields=name,price
   * @returns this
   */
  limitFields() {
    if (this.requestQuery.fields) {
      const fields = this.requestQuery.fields.split(',');
      this.queryBuilder.select(
        fields.map((field) => `${this.tableName}.${field}`),
      );
    }
    return this;
  }

  /**
   * Sort - sort by given object field(if fields have same value,
   * add one more of field to sort by it).
   * @returns this
   */
  sort() {
    if (this.requestQuery.sort) {
      const sortByFields = this.requestQuery.sort.split(',');

      sortByFields.forEach((field: string) => {
        let order: 'ASC' | 'DESC' = 'ASC';
        if (field.startsWith('-')) {
          field = field.slice(1);
          order = 'DESC';
        }
        this.queryBuilder.addOrderBy(`${this.tableName}.${field}`, order);
      });
    }

    return this;
  }

  /**
   * Paginate - get only objects from given page and limit.
   * @returns this
   */
  paginate() {
    if (this.requestQuery.page || this.requestQuery.limit) {
      const page = Number(this.requestQuery.page) || 1;
      const limit = Number(this.requestQuery.limit) || 10;
      const skip = (page - 1) * limit;
      this.queryBuilder.skip(skip).take(limit);
    }
    return this;
  }

  /**
   * @returns query builder object
   */
  getQueryBuilder() {
    return this.queryBuilder;
  }
}
