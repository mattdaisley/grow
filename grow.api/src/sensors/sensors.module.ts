import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from './entities/sensor.entity';
import { SensorReading } from './entities/sensor-reading.entity';
import { SensorsGateway } from './sensors.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, SensorReading]),
  ],
  exports: [SensorsService, SensorsGateway],
  controllers: [SensorsController],
  providers: [SensorsService, SensorsGateway]
})
export class SensorsModule {}
