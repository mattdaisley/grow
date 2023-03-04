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
    BullModule.forRootAsync({
      imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {

        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<number>('REDIS_PORT');

        return {
          redis: {
            host,
            port,
          },
        }
      },
      inject: [ConfigService],
    }),
    SerialModule,
    GpioModule
  ],
  providers: [],
})
export class AppModule {}
