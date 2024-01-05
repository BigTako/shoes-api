export enum JoinOperator {
  OR = 'or',
  AND = 'and',
}

// operators used in request query and criterias
export enum ComparisonOperator {
  EQ = 'eq',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  MATCHES_INSENSITIVE = 'matchesInsensitive',
  MATCHES_SENSITIVE = 'matchesSensitive',
  CONTAIN_ALL = 'containAll',
  CONTAINED_BY = 'containedBy',
}
