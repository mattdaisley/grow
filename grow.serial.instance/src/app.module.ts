import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { GpioModule } from './gpio/gpio.module';
import { SerialModule } from './serial/serial.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GpioModule,
    SerialModule
  ],
  providers: [],
})
export class AppModule {}
