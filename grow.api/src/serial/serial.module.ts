import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SerialService } from './serial.service';
import { SerialProcessor } from './serial.processor';
import { EventsModule } from 'src/events/events.module';
import { SensorsModule } from 'src/sensors/sensors.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'serial',
    }),
    EventsModule,
    SensorsModule
  ],
  exports: [SerialService],
  providers: [SerialService, SerialProcessor]
})
export class SerialModule {}
