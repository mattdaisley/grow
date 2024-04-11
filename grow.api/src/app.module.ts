import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { OutletsModule } from './outlets/outlets.module';
import { PumpsModule } from './pumps/pumps.module';
import { SensorsModule } from './sensors/sensors.module';
import { DynamicModule } from './dynamic/dynamic.module';
import { GpioModule } from './gpio/gpio.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.dev', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {

        const host = configService.get<string>('DATABASE_HOST');
        const port = configService.get<number>('DATABASE_PORT');
        const username = configService.get<string>('DATABASE_USERNAME');
        const password = configService.get<string>('DATABASE_PASSWORD');
        const database = configService.get<string>('DATABASE_DATABASE');

        console.log(`Connecting to database '${database}' as '${username}' at ${host}:${port} `)

        return {
          // type: 'mysql',
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [__dirname + '/subscriptions/**/*.entity{.ts,.js}'],
          synchronize: true,
        }
      },
      inject: [ConfigService],
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
    EventsModule,
    OutletsModule,
    PumpsModule,
    SensorsModule,
    DynamicModule,
    SubscriptionsModule,
    GpioModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
