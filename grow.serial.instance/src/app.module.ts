import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { GpioModule } from './gpio/gpio.module';
import { SerialModule } from './serial/serial.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // GpioModule,
    // SerialModule,
    SubscriptionsModule
  ],
  providers: [],
})
export class AppModule {}
