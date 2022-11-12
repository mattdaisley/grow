import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PumpsModule } from './pumps/pumps.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { SensorsModule } from './sensors/sensors.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'grow-db.cdyn2egnt6h9.us-west-1.rds.amazonaws.com',
      port: 3306,
      username: 'grow',
      password: 'MlP0cPibk5Z4',
      database: 'grow',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    EventsModule,
    PumpsModule,
    SensorsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
