import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { Category } from '../src/categories/entities/category.entity';
import { Custom } from '../src/customs/entities/custom.entity';
import { SheetsService } from '../src/sheets/sheets.service';
import { AppModule } from './../src/app.module';

import { CategoryTypeEnum } from '../src/categories/enums/subcategory-type.enum';
import { brands, categories, models } from './categories-test-data';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let sheetService: SheetsService;
  let sheetCustoms: Custom[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    sheetService = app.get<SheetsService>(SheetsService);

    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(Category).execute();

    sheetCustoms = await sheetService.getAll();
  }, 100000); // give beforeAll 100 seconds to complete getting sheetCustoms from sheet

  afterAll(async () => app.close());

  describe('Customs routes', () => {
    it('finds all loaded customs', async () => {
      return await request(app.getHttpServer())
        .get('/customs')
        .expect(200)
        .then((res) => {
          expect(res.body.length).toEqual(sheetCustoms.length);
        });
    });

    it('finds custom by code', async () => {
      return await request(app.getHttpServer())
        .get(`/customs/${sheetCustoms[0].code}`)
        .expect(200)
        .then((res) => {
          expect(res.body.code).toEqual(sheetCustoms[0].code);
        });
    });

    it('throws NotFoundException if custom not found', async () => {
      await request(app.getHttpServer())
        .get(`/customs/0`)
        .expect(404)
        .then((responce) => {
          expect(responce.body.message).toContain('Custom not found');
        });
    });

    it('updates custom by code', async () => {
      return await request(app.getHttpServer())
        .patch(`/customs/${sheetCustoms[0].code}`)
        .send({ name: 'new name' })
        .expect(200)
        .then((res) => {
          expect(res.body.name).toEqual('new name');
        });
    });

    it('throws BadRequestException if body is invalid', async () => {
      await request(app.getHttpServer())
        .patch(`/customs/${sheetCustoms[0].code}`)
        .send({ name: 'ne' })
        .expect(400)
        .then((responce) => {
          expect(responce.body.message).toContain(
            'name must be longer than or equal to 3 characters',
          );
        });
    });
  });

  describe('Categories routes', () => {
    let createdCategory: Category;
    let joinedCategory: Category;

    it('creates categories', () => {
      return Promise.all(
        categories.map((category) => {
          return request(app.getHttpServer())
            .post('/categories')
            .send(category)
            .expect(201)
            .then((res) => {
              expect(res.body.name).toEqual(category.name);
              if (category === categories[0]) {
                createdCategory = res.body;
              }
            });
        }),
      );
    });

    it('throws an error if category already exists', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send(categories[0])
        .expect(400)
        .then((responce) => {
          expect(responce.body.message).toContain(
            'name price-under-3000 already exists',
          );
        });
    });

    it('filters categories by name', async () => {
      return request(app.getHttpServer())
        .get(`/categories?name=${categories[0].name}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ name: categories[0].name }),
            ]),
          );
        });
    });

    it('sorts categories by name in descending order', () => {
      return request(app.getHttpServer())
        .get('/categories?sort=-name')
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ name: expect.any(String) }),
            ]),
          );
          // Check if the first category's name is alphabetically after or equal to the second one
          expect(res.body[0].name >= res.body[1].name).toBe(true);
        });
    });

    it('limits the number of categories returned', () => {
      return request(app.getHttpServer())
        .get('/categories?limit=1')
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBeLessThanOrEqual(1);
        });
    });

    it('gets all customs by specific category', async () => {
      return await request(app.getHttpServer())
        .get(`/customs/category/${createdCategory.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('gets customs by specific category name', async () => {
      return await request(app.getHttpServer())
        .get(`/customs/category/name/${createdCategory.name}`)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('filters customs by name within a specific category', async () => {
      const testCustom = sheetCustoms.find((custom) => custom.price < 3000);
      return request(app.getHttpServer())
        .get(
          `/customs/category/name/${createdCategory.name}?name=${testCustom.name}`,
        )
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ name: testCustom.name }),
            ]),
          );
        });
    });

    it('sorts customs by name in descending order within a specific category', () => {
      return request(app.getHttpServer())
        .get(`/customs/category/name/${createdCategory.name}?sort=-price`)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ price: expect.any(Number) }),
            ]),
          );
          // Check if the first custom's name is alphabetically after or equal to the second one
          expect(res.body[0].price >= res.body[1].price).toBe(true);
        });
    });

    it('throws an error trying to create category with invalid body', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send([])
        .expect(400)
        .then((responce) => {
          expect(responce.body.message).toContain(
            'criterias must contain at least 1 elements',
          );
          expect(responce.body.message).toContain('name must be a string');
        });
    });

    it('limits the number of customs returned within a specific category', async () => {
      const testCustomsCount = sheetCustoms.filter(
        (custom) => custom.price < 3000,
      ).length;
      let limitTo = testCustomsCount < 3 ? 3 : testCustomsCount - 2;

      return request(app.getHttpServer())
        .get(`/customs/category/name/${createdCategory.name}?limit=${limitTo}`)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBeLessThanOrEqual(limitTo);
        });
    });

    it('should not create a category with invalid criterias', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Test Category',
          criterias: [
            {
              invalidKey: 'invalidValue', // Invalid criteria
            },
          ],
        })
        .expect(400) // Expecting HTTP Status 400 (Bad Request)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid criterias');
        });
    });

    it('should not create a category with invalid nested criterias', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Test Category',
          criterias: [
            {
              operator: 'or', // Invalid criteria
              conditions: [
                {
                  field: 'price',
                  comparison: 'eq',
                  value: 1000,
                },
                {
                  comparison: 'eq',
                  value: 2000,
                },
              ],
            },
          ],
        })
        .expect(400) // Expecting HTTP Status 400 (Bad Request)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid criterias');
        });
    });

    it('creates brand category', async () => {
      return await request(app.getHttpServer())
        .post('/categories/brand')
        .send(brands[0])
        .expect(201)
        .then((res) => {
          expect(res.body.name).toEqual(`${brands[0].name}`);
        });
    });

    it('finds customs by brand name', async () => {
      return await request(app.getHttpServer())
        .get(`/customs/brand/${brands[0].name}`)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('throws and error tryint to find customs by invalid brand name', async () => {
      await request(app.getHttpServer())
        .get('/customs/brand/brand-not-exists')
        .expect(404)
        .then((responce) => {
          expect(responce.body.message).toContain('Category not found');
        });
    });

    it('creates model category', async () => {
      return await request(app.getHttpServer())
        .post('/categories/model')
        .send(models[0])
        .expect(201)
        .then((res) => {
          expect(res.body.name).toEqual(`${models[0].name}`);
        });
    });

    it('throws and error tryint to find customs by invalid model name', async () => {
      await request(app.getHttpServer())
        .get('/customs/model/model-not-exists')
        .expect(404)
        .then((responce) => {
          expect(responce.body.message).toContain('Category not found');
        });
    });

    it('creates category based on existing categories', async () => {
      return await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'nike-under-3000-kids',
          criterias: [
            {
              category: 'price-under-3000',
            },
            {
              category: `nike`,
              type: CategoryTypeEnum.BRAND,
            },
            {
              category: 'kids-sizes',
            },
          ],
        })
        .expect(201)
        .then((res) => {
          expect(res.body.name).toEqual('nike-under-3000-kids');
          joinedCategory = res.body;
        });
    });

    it('throws NotFound tryint to create category based on not existing categories', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'nike-under-3000-kids',
          criterias: [
            {
              category: 'price-under-3000',
            },
            {
              category: `nike`,
              type: CategoryTypeEnum.BRAND,
            },
            {
              category: 'kids-sizes',
            },
            {
              category: 'not-existing-category',
            },
          ],
        })
        .expect(404)
        .then((responce) => {
          expect(responce.body.message).toContain(
            `Category not found by field: not-existing-category`,
          );
        });
    });

    it('gets joined category', async () => {
      return await request(app.getHttpServer())
        .get(`/categories/${joinedCategory.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body.name).toEqual(joinedCategory.name);
          joinedCategory = res.body;
        });
    });

    it('gets customs by joined category name', async () => {
      return await request(app.getHttpServer())
        .get(`/customs/category/name/${joinedCategory.name}`)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBeGreaterThan(0);
          expect(
            res.body.every(
              (custom) => custom.price < 3000 && /\bnike\b/i.test(custom.name),
            ),
          ).toBeTruthy();
        });
    });

    it('updates category', async () => {
      return await request(app.getHttpServer())
        .patch(`/categories/${createdCategory.id}`)
        .send({ name: 'new name' })
        .expect(200)
        .then((res) => {
          expect(res.body.name).toEqual('new name');
          createdCategory.name = 'new name';
        });
    });

    it('deletes category', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${createdCategory.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body.name).toEqual(createdCategory.name);
        });
      return await request(app.getHttpServer())
        .get(`/categories/${createdCategory.id}`)
        .expect(404);
    });
  });
});
