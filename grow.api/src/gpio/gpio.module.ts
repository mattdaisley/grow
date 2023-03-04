import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { DynamicModule } from '../dynamic/dynamic.module';
import { GpioProcessor } from './gpio.processor';
import { GpioService } from './gpio.service';

@Module({
  imports: [
  BullModule.registerQueue({
      name: 'gpio',
    }),
    DynamicModule
  ],
  exports: [GpioService],
  providers: [GpioService, GpioProcessor]
})
export class GpioModule {}
