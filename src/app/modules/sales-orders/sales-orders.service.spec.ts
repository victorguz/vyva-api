import { Test, TestingModule } from '@nestjs/testing';

describe('SalesOrdersService', () => {
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
    }).compile();

    service = module.get<any>(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
