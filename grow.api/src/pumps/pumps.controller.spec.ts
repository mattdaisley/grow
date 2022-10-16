import { Test, TestingModule } from '@nestjs/testing';
import { PumpsController } from './pumps.controller';
import { PumpsService } from './pumps.service';

describe('PumpsController', () => {
  let controller: PumpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PumpsController],
      providers: [PumpsService],
    }).compile();

    controller = module.get<PumpsController>(PumpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
