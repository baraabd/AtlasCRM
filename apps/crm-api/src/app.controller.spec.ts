import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('should return "Hello World!"', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    const appController = moduleRef.get(AppController);
    expect(appController.getHello()).toBe('Hello World!');
  });
});
