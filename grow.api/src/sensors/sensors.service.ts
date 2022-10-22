import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { CreateSensorReadingDto } from './dto/create-sensor-reading.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { Sensor } from './entities/sensor.entity';
import { SensorReading } from './entities/sensor-reading.entity';
import { GetSensorReadingDto } from './dto/get-sensor-reading.dto';
import { SensorsGateway } from './sensors.gateway';

@Injectable()
export class SensorsService {

  constructor(
    @InjectRepository(Sensor)
    private sensorRepository: Repository<Sensor>,

    @InjectRepository(SensorReading)
    private sensorReadingRepository: Repository<SensorReading>,

    private readonly sensorsGateway: SensorsGateway,
  ) { }

  async create(createSensorDto: CreateSensorDto): Promise<Sensor> {
    return await this.sensorRepository.save(plainToClass(Sensor, createSensorDto));
  }

  async findAll(): Promise<Sensor[]> {
    return await this.sensorRepository.find();
  }

  async findOne(id: number): Promise<Sensor> {
    return await this.sensorRepository.findOneBy({ id });
  }

  async findOneByIndex(index: string): Promise<Sensor> {
    return await this.sensorRepository.findOneBy({ index });
  }

  async update(id: number, updateSensorDto: UpdateSensorDto): Promise<UpdateResult> {
    return await this.sensorRepository.update(id, plainToClass(Sensor, updateSensorDto))
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.sensorRepository.delete(id);
  }

  async createReading(id: number, createSensorReadingDto: CreateSensorReadingDto): Promise<SensorReading> {
    const sensor = await this.sensorRepository.findOneBy({ id });

    const sensorReading = plainToClass(SensorReading, createSensorReadingDto);
    sensorReading.sensor = sensor;
    sensorReading.value = Number(sensorReading.value);

    await this.sensorReadingRepository.save(sensorReading);

    this.sensorsGateway.server.emit('reading', JSON.stringify(sensorReading));

    return sensorReading;
  }

  async findReadings(id: number, limit: number = 100): Promise<GetSensorReadingDto[]> {
    const readings = await this.sensorReadingRepository.find({
      select: {
        id: true,
        value: true,
        created_at: true
      },
      where: {
        sensor: {
          id
        }
      },
      order: {
        id: "DESC",
      },
      take: limit
    });

    return readings;
  }
}
