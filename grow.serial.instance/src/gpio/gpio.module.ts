import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GpioService } from './gpio.service';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  exports: [GpioService],
  providers: [GpioService]
})
export class GpioModule {}
