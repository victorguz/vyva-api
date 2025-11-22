import { Test, TestingModule } from '@nestjs/testing';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';

describe('DomainsController', () => {
  let controller: DomainsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DomainsController],
      providers: [
        {
          provide: DomainsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DomainsController>(DomainsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

