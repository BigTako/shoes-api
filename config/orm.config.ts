import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const typeTemplates = {
  array: process.env.DB_ARRAY_TYPE_TEMPLATE,
  stringMatches: process.env.DB_STRING_MATCHES_TYPE_TEMPLATE,
};

const operators = {
  gt: process.env.DB_GT_OPERATOR || '>',
  gte: process.env.DB_GTE_OPERATOR || '>=',
  lt: process.env.DB_LT_OPERATOR || '<',
  lte: process.env.DB_LTE_OPERATOR || '<=',
  eq: process.env.DB_EQ_OPERATOR || '=',
  matchesInsensitive: process.env.DB_MATCHES_CI_OPERATOR || '~*',
  matchesSensitive: process.env.DB_MATCHES_CS_OPERATOR || '~',
  containAll: process.env.DB_CONTAINS_ALL_OPERATOR || '@>',
  containedBy: process.env.DB_CONTAINED_BY_OPERATOR || '<@',
};

const dbConfig = {
  type: `${process.env.DB_TYPE}`,
  host: `${process.env.DB_HOST}`,
  port: `${process.env.DB_PORT}`,
  username: `${process.env.DB_USERNAME}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_NAME}`,
  entities: [`${process.env.ENTITIES_PATH}`],
  migrations: [`${process.env.MIGRATIONS_DIR}/*.js`],
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production',
  // extra: {
  //   ssl: {
  //     require: true,
  //     rejectUnauthorized: false,
  //   },
  // },
};

// create aliases for configurations to ConfigModule use it
export const ormConfig = registerAs('ormConfig', () => dbConfig);
export const dbTypeTemplatesConfig = registerAs(
  'dbTypeTemplates',
  () => typeTemplates,
);
export const dbOperatorsConfig = registerAs('dbOperators', () => operators);
export const connectionSource = new DataSource(dbConfig as DataSourceOptions);
