import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { GpioService } from './gpio.service';
import { GpioProcessor } from './gpio.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'gpio',
    }),
  ],
  exports: [GpioService],
  providers: [GpioService, GpioProcessor]
})
export class GpioModule {}
