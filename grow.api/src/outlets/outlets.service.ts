import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { Outlet } from './entities/outlet.entity';
import { SerialService } from 'src/serial/serial.service';
import { OutletCommandDto } from './dto/outlet-command.dto';

@Injectable()
export class OutletsService {

  constructor(
    @InjectRepository(Outlet)
    private outletsRepository: Repository<Outlet>,

    private serialService: SerialService
  ) { }

  async create(createOutletDto: CreateOutletDto): Promise<Outlet> {
    return await this.outletsRepository.save(plainToClass(Outlet, createOutletDto));
  }

  async findAll(): Promise<Outlet[]> {
    return await this.outletsRepository.find();
  }

  async findOne(id: number): Promise<Outlet> {
    return await this.outletsRepository.findOneBy({ id });
  }

  async findOneByIndex(index: number): Promise<Outlet> {
    return await this.outletsRepository.findOneBy({ index });
  }

  async update(id: number, updateOutletDto: UpdateOutletDto): Promise<UpdateResult> {
    return await this.outletsRepository.update(id, plainToClass(Outlet, updateOutletDto))
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.outletsRepository.delete(id);
  }

  async command(id: number, outletCommandDto: OutletCommandDto): Promise<Outlet> {
    const outlet = await this.outletsRepository.findOneBy({ id });

    if (outlet) {
      console.log("sending command to outlet", outlet.index, outletCommandDto.value);
      const message = `H/O/${outlet.index}/${outletCommandDto.value}\n`
      await this.serialService.write(message);
    }

    return outlet;
  }
}

