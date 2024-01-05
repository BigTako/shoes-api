import { CreateCategoryDto } from '../src/categories/dto/create-category.dto';
import {
  ComparisonOperator,
  JoinOperator,
} from '../src/criterias/enums/criteria';

export const categories: CreateCategoryDto[] = [
  {
    name: 'price-under-3000',
    criterias: [
      {
        field: 'price',
        comparison: ComparisonOperator.LT,
        value: 3000,
      },
    ],
  },
  {
    name: 'kids-sizes',
    criterias: [
      {
        field: 'sizes',
        comparison: ComparisonOperator.CONTAIN_ALL,
        value: [36, 37],
      },
    ],
  },
  {
    name: 'low-cost-nike-or-adidas-for-kids',
    criterias: [
      {
        operator: JoinOperator.OR,
        conditions: [
          {
            operator: JoinOperator.AND,
            conditions: [
              {
                operator: JoinOperator.OR,
                conditions: [
                  {
                    field: 'model',
                    comparison: ComparisonOperator.MATCHES_INSENSITIVE,
                    value: 'nike',
                  },
                  {
                    field: 'name',
                    comparison: ComparisonOperator.MATCHES_INSENSITIVE,
                    value: 'nike',
                  },
                ],
              },
              {
                field: 'price',
                comparison: ComparisonOperator.LT,
                value: 2500,
              },
            ],
          },
          {
            operator: JoinOperator.AND,
            conditions: [
              {
                operator: JoinOperator.OR,
                conditions: [
                  {
                    field: 'model',
                    comparison: ComparisonOperator.MATCHES_INSENSITIVE,
                    value: 'adidas',
                  },
                  {
                    field: 'name',
                    comparison: ComparisonOperator.MATCHES_INSENSITIVE,
                    value: 'adidas',
                  },
                ],
              },
              {
                field: 'sizes',
                comparison: ComparisonOperator.CONTAIN_ALL,
                value: [36, 37],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const brands = [
  {
    name: 'nike',
  },
  {
    name: 'adidas',
  },
];

export const models = [
  {
    name: 'Lebron',
  },
  {
    name: 'Yeezy',
  },
];
