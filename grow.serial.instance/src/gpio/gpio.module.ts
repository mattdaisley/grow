import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { GpioService } from './gpio.service';
import { GpioProcessor } from './gpio.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'gpio',
    }),
  ],
  exports: [GpioService],
  providers: [GpioService, GpioProcessor]
})
export class GpioModule {}
