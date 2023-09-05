import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SerialService } from './serial.service';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  exports: [SerialService],
  providers: [SerialService]
})
export class SerialModule {}
