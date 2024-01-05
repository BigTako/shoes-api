import { ComparisonOperator } from '../criterias/enums/criteria';

export type FeautresQuery = {
  sort?: string;
  page?: string;
  limit?: string;
  fields?: string;
};

export type FeaturesQuerySelector = {
  [key: string]: number | string;
};

export type FeautresQueryItem = {
  [key: string]: number | string | FeaturesQuerySelector;
};

export type DbTypeTemplate = { array: string; stringMatches: string };
