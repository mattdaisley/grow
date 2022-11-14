import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SerialProcessor } from './serial.processor';
import { EventsModule } from 'src/events/events.module';
import { OutletsModule } from 'src/outlets/outlets.module';
import { SensorsModule } from 'src/sensors/sensors.module';
import { SerialService } from './serial.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'serial',
    }),
    EventsModule,
    forwardRef(() => OutletsModule),
    SensorsModule
  ],
  exports: [SerialService],
  providers: [SerialService, SerialProcessor]
})
export class SerialModule {}
