import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SerialModule } from './serial/serial.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'ec2-13-57-221-175.us-west-1.compute.amazonaws.com',
        port: 6379,
      },
    }),
    SerialModule
  ],
  providers: [],
})
export class AppModule {}
