import { Test, TestingModule } from '@nestjs/testing';

describe('SalesOrdersController', () => {
  let controller: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
    }).compile();

    controller = module.get<any>(null);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
