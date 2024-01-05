# Shoes Store API👟

#### Techology Stack

[![BackEnd](https://skillicons.dev/icons?i=nodejs,ts,nest,jest,postgresql)](https://skillicons.dev)

_And also GoogleApi, Cron and Postman for testing API._

[Postman collection for testing API](https://documenter.getpostman.com/view/27994867/2s9YsDmFWE)

## Overview

> Shoes Store API is a simple API implemented using NestJS using PostgreSQL and TypeORM. It provides convinient interface for selecting and updating customs, with automatic loading from Google Sheet.

## Why NestJS?

> There are few reason NestJs was chosen as platform for creating API on:
>
> 1. **All needed tools out of box** - Nest provides all required functionality out of the box. Of course, it is won't be so easy to connect and implement some custom tools as if we were using for example Express, but our app isn't so complex to require special features.
> 2. **Easy to keep code structured** - Nest provides an out-of-the-box application architecture which allows developers and teams to create highly testable, scalable, loosely coupled, and easily maintainable applications.
> 3. **Full support of TypeScript** - it's a fact that writting code on JS is conveniet and nice but when we talk about scalability and robustness, TS seems a lot nicer.

## Why PostgreSQL?

> There are few reason PostgreSQL was chosen as app DB:
>
> 1. **Complex types support** - in app run time it required to store arrays and JSON format data somewhere. Postgre supports these and many others complex type support.
> 2. **Own types support** - Postgre allowes to create on type like enums, which a huge plus if wee talk about validation.
> 3. **ACID Compliance**: PostgreSQL is fully ACID compliant (Atomicity, Consistency, Isolation, Durability), ensuring data integrity and consistency even in the event of system failures.

## Configuration

### Google Sheet

> In order to get access to google sheet with customs data, you have to configure your google credentials. All steps how to do that are explained [here](https://www.youtube.com/watch?v=PFJNJQCU_lo&ab_channel=JamesGrimshaw). When everything is done, you will get file with pretty strange name and `.json` extention and same strage long email. Rename `.json` file into `google-credentials.json` and put it into root directory(`shoes-api`) of project.

#### Sheet

> Your sheet should look like this: ![image](https://github.com/BigTako/shoes-api/assets/87268303/a4bda779-6dd0-4690-a264-2c73a83484a2)

### Project

> To run API , firstly clone my repository with API using `git clone https://github.com/BigTako/shoes-api.git` Then run command `npm install` in cloned project root directory to install all necessary packages.

### Configuring database

> Next it's required to configure a database, for that download latest version of PostgreSQL from [here](http://postgresql.org/download/) to your computer and install it. In some step you will define `user` and `password`, do not forget this data. Then, you'll need to create at least one database(if you want to test - 2 databases).
>
> Go to folder where `psql` is located in ( default is `C:\Program Files\PostgreSQL\16\bin`), open `cmd` and run command `createdb -U <username> <DEVELOPMENT DB NAME>`. This will create database with `username` and `password` as those you've set while PostgreSQL install. Default `host` will be set as `localhost`. If you're going to test app also do the same steps but set another db name.
>
> During development process will need to interract with DB. Of course, you can use `cmd` with `psql` but i prefer using special software(i use [DBeaver](<[https://dbeaver-io.translate.goog/?_x_tr_sl=en&_x_tr_tl=uk&_x_tr_hl=uk&_x_tr_pto=sc](https://dbeaver-io.translate.goog/?_x_tr_sl=en&_x_tr_tl=uk&_x_tr_hl=uk&_x_tr_pto=sc)>)).
> When it's done, use comfortable DB working program and create new PostgreSQL connection.
> In order to drop db use `dropdb -U <username> <DB NAME>`.

## Configuration variables

> Depends on what you want to do with solution, there is thee 'modes': `development`, `production` and `test`. Despite name, there wont be a lot of difference in these files. Common settings will look like that(database configurations, operators):

```ini
# SERVER CONFIG ############################
PORT = 3000 # port server will listen to
# CRON CONFIG ############################
CRON_PERIOD = '0 * * * *' #once per hour
# DATABASE CONFIG ############################
# DATABASE #################
# postgres, mysql, sqlite...
DB_TYPE = 'postgres'
# database name
DB_NAME = 'db-name-mode'
 # database host
DB_HOST = 'localhost'
# database port
DB_PORT = 5432
# username you set when installing db
DB_USERNAME = 'postgres'
# password for user
DB_PASSWORD = 'root'
# MIGRATIONS
MIGRATIONS_DIR = 'migrations' # where migrations are stored
ENTITIES_PATH = 'dist/**/*.entity.js' # !!!!!!!! src/**/*.entity.js for .env.test
# DATABASE OPERATORS ########
DB_GT_OPERATOR = '>'
DB_GTE_OPERATOR = '>='
DB_LT_OPERATOR = '<'
DB_LTE_OPERATOR = '<='
DB_EQ_OPERATOR = '='
DB_MATCHES_CI_OPERATOR = '~*'
DB_MATCHES_CS_OPERATOR = '~'
DB_CONTAINS_ALL_OPERATOR = '@>'
DB_CONTAINED_BY_OPERATOR = '<@'
# DATABASE TYPE TEMPLATES #####
DB_ARRAY_TYPE_TEMPLATE = '{<VALUE>}'
DB_STRING_MATCHES_TYPE_TEMPLATE = '\m<VALUE>\M'
# SPREAD SHEET CONFIG ############################
# file with google credentials
GOOGLE_CREDENTIALS_FILE = 'google-credentials.json'
# id of the spread sheet
SPREAD_SHEET_ID = 'id'
# just leave it as is
SPREAD_SHEET_SCOPES = 'https://www.googleapis.com/auth/spreadsheets'
# name of the row with product code(article)
SHEET_CODE_ROW_TITLE = 'Code'
 # name of the row with product name
SHEET_NAME_ROW_TITLE = 'Name'
# name of the row with product price
SHEET_PRICE_ROW_TITLE = 'Price'
# name of the row with product sizes
SHEET_SIZES_ROW_TITLE = 'Sizes'
# sign that indicates that size is available in each cell
SHEET_SIZE_AVAILABLE_SIGN = '+'
```

#### Database operators configuration

> This project uses PostgreSQL as database, so there're used operators which are supported by Postgre.
> If you'll need to change db for some reason, you will need to change operators too. Also each DB has its own representation of complex data types(arrays, regexp...), to change DB, you'll need to change them too. To make this process easier, i extracted operators and type templates into separate `config/orm.config.ts` file. Migrating if your DB settings are different from these:

```inv
	type: `${process.env.DB_TYPE}`,
	host: `${process.env.DB_HOST}`,
	port: `${process.env.DB_PORT}`,
	username: `${process.env.DB_USERNAME}`,
	password: `${process.env.DB_PASSWORD}`,
	database: `${process.env.DB_NAME}`,
```

> feel free free to change it, but **do not touch rest of dbConfig**.

#### Development

> If you are a developer, you'll have to create new file in root directory of project: `.env.development`. And set all variables by template above. Finally, execute `npm run start:dev`.

#### Testing

> Application allows to test routes by E2E test using Jest. To test app you'll need to create new `.env.test` file in root project directory and specify all config variables using template above. **Test you application ONLY using separate database**, this the main reason we have multiple config files. Then created, execute `npm run test:e2e` which will execute all tests in `test` directory.

#### Production

> In production usually host provides special functionality to specify config variables, but if it does not, create `.env.production` file and specify all config variables using template above. Then created, execute `npm run start:prod` which will lauch app using `node`.

> **❗Disclamer**: Do not forget to remove `google-credentials.json` from `.gitignore` when deploying your application.

#### Migrations

> Since you DB is not synchronized with server in production, for safety reasons, DB tables wont be automaticaly created on app lauch, so you'll need to use migrations. Execute `npm run migration:generate --name=<migration name>` in root directory of project to create migration.

**⚠do not forget to remove all tables from database before generating migration**

> **❗Disclamer**: `--name` parameter in `npm run migration:*` commands is supported only on Linux in form it is in repo, if you want to make it available on Windows, go to `package.json` and change `$npm_config_name` in all commands to be `%npm_config_name%`, this will allow parameter to work on Windows but not on Linux `¯\_(ツ)_/¯`.

> **❗Also disclamer**: some hosts (if you use app in production) which use PostgreSQL as DB as require special options in `orm.config.ts` to work with migrations. If you will see something like `FATAL: no pg_hba.conf entry for host`, just to to `orm.config.ts` and uncomment these lines:

```json
    "extra": {
       "ssl": {
         "require": true,
         "rejectUnauthorized": false,
       },
  }
```

> then run `npm run migration:run` on your production environment to execute migration.

## Cron

> For reloading customs info from sheet i use `cron`. Period is set in `.env` config files using special `cron` notation. You can formulate yours using [Cron Guru](https://crontab.guru/)website and change it as you wish.

## Interraction

#### Query filtering and sorting

##### Routes

> All `findMany`(those to select objects at all or by some criteria) routes API support special feature `quering`.That means that you can controll count and view of documents route returns.

- example: `http://127.0.0.1:3000/api/v1/customs/?fields=code,name,price&sort=-price&limit=3&page=1`
  Here:
- fields = use `fields` parameter to select only defined fields in each of returned documents.
- sort - use `sort` parameter to sort by any field of Post model `sort=field`. Order of sorting is regulated by `-` at the beginning of `field` what means `reversed`.
- limit - use `limit` parameter to limit the number of posts to be returned.
- page - use `page` to divide returned docs into groups(size of group defined by `limit`).
- Any other fields will be considered as 'filters' , you can user them by passing `field[operator]=value`.

#### Comparison Operators

> We need some how compare values from db with ones we provide. For that there is special notation.

- `[gt]` - greater than value(Number fields)
- `[lt]` - less than value(Number fields)
- `[gte]` - greater that or equal to value(Number fields)
- `[lte]` - less than or equal to value(Number fields)
- `[eq]` - equals
- `[matchesInsensitive]` - checks if provided value is in string field case insensitive
- `[matchesSensitive]` - checks if provided value is in string field case sensitive
- `[containAll]` - checks if array db field contains all values provided in `value`
- `[containedBy]` - checks every value from array field is values provided in `value`
- nothing means `equals`, example `field=value`

#### Creating categories

> One of the most important features of app is to create categories to select customs by some criterias and store them in DB. To create new category you'll need to `POST` this: body

```json
{
  "name": "string",
  "type": "brand | model | category",
  "criterias": ["...(not empty!)"]
}
```

> Where `name` is unique `string`, `type` is optional parameter which defines to type category is(`category` if not specified), `criterias` is array of selection criterias by which customs will be selected. By default app join all criterias defined without operator with `and` condition.
> There are three types of criterias you can add to `criterias` array:

0. **Operator** - allows to join multiple criterias by operator.

   ```json
   // Body
   {
     "operator": "and | or",
     "conditions": ["...(not empty!)"]
   }
   ```

   ```json
   // example (will select all customs which price is greater that 3000 and name STRICTLY equals 'Nike,Lebron')
   {
     "operator": "or",
     "conditions": [
       {
         "field": "price",
         "comparison": "gt",
         "value": 3000
       },
       {
         "field": "name",
         "comparison": "eq",
         "value": "Nike,Lebron"
       }
     ]
   }
   ```

   ```json
   // you can even create nested criterias
   // equal to query (custom.price < 300O AND customs.price > 1000) OR (custom.name ~* \mAdidas\M AND custom.sizes @> {36,37,38})
   {
     "operator": "or",
     "conditions": [
       {
         "operator": "and",
         "conditions": [
           {
             "field": "price",
             "comparison": "lt",
             "value": 3000
           },
           {
             "field": "price",
             "comparison": "gt",
             "value": 1000
           }
         ]
       },
       {
         "operator": "and",
         "conditions": [
           {
             "field": "name",
             "comparison": "matchesInsensitive",
             "value": "Adidas"
           },
           {
             "field": "sizes",
             "comparison": "containAll",
             "value": [36, 37, 38]
           }
         ]
       }
     ]
   }
   ```

1. **Field** - field corresponds to entity field in db we want to select by. For `comparison` field specify operator from comparison operators listened above.

   ```json
    {
      "field": "field_name",
      "comparison": "comparison operators",
      "value": "value required to compare to"
    }

    // example
    // corresponds to query WHERE custom.price > 1000 AND customs.sizes @> {36,38}
    "criterias": [
        {
        "field": "price",
        "comparison": "gt",
        "value": 1000
      },
      {
        "field": "sizes",
        "comparison": "containAll",
        "value": [36 , 41]
      }
    ]
   ```

2. **Category** - you can also pass already existing categories as criteria, then criterias of category you are creating will be extended with those from `category` found by name.

```json
  // imagine you have category
  {
    "name": "low-cost",
    "criterias": [
      {
        "field": "price",
        "comparison": "lt",
        "value": 3000
      }
    ]
  }

  // example
  // that you can specify extend it
  {
    "name": "nike-low-cost",
    "criterias": [
      {
        "category": "low-cost"
      },
      {
        "field": "name",
        "comparison": "matchesInsensitive",
        "value": "nike"
      }
    ]
  }
  // you can specify as many as you want
  {
    "name": "nike-low-cost-or-adidas",
    "criterias": [
      {
        "operator": "or",
        "conditions": [
          {
            "category": "nike-low-cost"
          },
          {
            "category": "adidas",
            "type": "brand"
          }
        ]
      }
    ]
  }
```

### Brands

> Brand is just a subcategory of customs where `name` of brand exists `caseInsensitive` in `custom.name` or `caseSensitive` in `custom.model` as a separate word.

This criterias are used to create it:

```json
{
  "operator": "or",
  "conditions": [
    {
      "field": "model",
      "comparison": "matchesSensitive",
      "value": "name_of_brand"
    },
    {
      "field": "name",
      "comparison": "matchesInsensitive",
      "value": "name_of_brand"
    }
  ]
}
```

### Models

> Brand is just a subcategory of customs where `name` of model exists `caseSensitive` in `custom.model` as a separate word.

This criterias are used to create it:

```json
{
  "field": "model",
  "comparison": "matchesSensitive",
  "value": "model_name"
}
```

> Mady by `BigTako`
