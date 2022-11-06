import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SerialService } from './serial.service';
import { SerialProcessor } from './serial.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'serial',
    }),
  ],
  exports: [SerialService],
  providers: [SerialService, SerialProcessor]
})
export class SerialModule {}
