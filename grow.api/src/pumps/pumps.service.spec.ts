import { Test, TestingModule } from '@nestjs/testing';
import { PumpsService } from './pumps.service';

describe('PumpsService', () => {
  let service: PumpsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PumpsService],
    }).compile();

    service = module.get<PumpsService>(PumpsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
