import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { Pump } from './entities/pump.entity';

@Injectable()
export class PumpsService {
  private readonly pumps: Pump[] = [];

  create(createPumpDto: CreatePumpDto) {
    const pumpIndex = this.pumps.findIndex(pump => pump.index === createPumpDto.index);
    if (pumpIndex < 0) {
      this.pumps.push(plainToClass(Pump, createPumpDto));
    }

    return this.pumps.find(pump => pump.index === createPumpDto.index);
  }

  findAll() {
    return this.pumps;
  }

  findOne(index: number) {
    return this.pumps.find(pump => pump.index === index);
  }

  update(index: number, updatePumpDto: UpdatePumpDto) {
    const pumpIndex = this.pumps.findIndex(pump => pump.index === updatePumpDto.index);

    this.pumps[pumpIndex] = plainToClass(Pump, instanceToPlain(updatePumpDto));

    return this.pumps.find(pump => pump.index === updatePumpDto.index);
  }

  remove(index: number) {
    const pumpIndex = this.pumps.findIndex(pump => pump.index === index);

    this.pumps.splice(pumpIndex, 1);
  }
}
