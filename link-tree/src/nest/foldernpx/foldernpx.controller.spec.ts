import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { FoldernpxController } from './foldernpx.controller';

describe('FoldernpxController', () => {
  let controller: FoldernpxController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [FoldernpxController],
      }).compile();

    controller = module.get<FoldernpxController>(
      FoldernpxController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
