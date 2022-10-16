import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { Pump } from './entities/pump.entity';
import { SerialService } from 'src/serial/serial.service';

@Injectable()
export class PumpsService {

  constructor(
    @InjectRepository(Pump)
    private pumpRepository: Repository<Pump>,

    private serialService: SerialService
  ) { }

  async create(createPumpDto: CreatePumpDto): Promise<Pump> {
    return await this.pumpRepository.save(plainToClass(Pump, createPumpDto));
  }

  async findAll(): Promise<Pump[]> {
    return await this.pumpRepository.find();
  }

  async findOne(id: number): Promise<Pump> {
    const pump = await this.pumpRepository.findOneBy({ id });
    console.log(pump);
    if (pump) {
      const message = `H/P/${pump.index}/1\n`
      await this.serialService.write(message);
    }

    return pump;
  }

  async update(id: number, updatePumpDto: UpdatePumpDto): Promise<UpdateResult> {
    return await this.pumpRepository.update(id, plainToClass(Pump, updatePumpDto))
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.pumpRepository.delete(id);
  }
}

