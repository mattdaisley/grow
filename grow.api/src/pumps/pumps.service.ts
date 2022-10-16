import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { Pump } from './entities/pump.entity';

@Injectable()
export class PumpsService {
  private readonly pumps: Pump[] = [];

  constructor(
    @InjectRepository(Pump)
    private pumpRepository: Repository<Pump>
  ) { }

  async create(createPumpDto: CreatePumpDto): Promise<Pump> {
    return await this.pumpRepository.save(plainToClass(Pump, createPumpDto));
  }

  async findAll(): Promise<Pump[]> {
    return await this.pumpRepository.find();
  }

  async findOne(id: number): Promise<Pump> {
    return await this.pumpRepository.findOneBy({ id });
  }

  async update(id: number, updatePumpDto: UpdatePumpDto): Promise<UpdateResult> {
    return await this.pumpRepository.update(id, plainToClass(Pump, updatePumpDto))
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.pumpRepository.delete(id);
  }
}

