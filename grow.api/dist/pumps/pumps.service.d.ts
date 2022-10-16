import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { Pump } from './entities/pump.entity';
export declare class PumpsService {
    private pumpRepository;
    private readonly pumps;
    constructor(pumpRepository: Repository<Pump>);
    create(createPumpDto: CreatePumpDto): Promise<Pump>;
    findAll(): Promise<Pump[]>;
    findOne(id: number): Promise<Pump>;
    update(id: number, updatePumpDto: UpdatePumpDto): Promise<UpdateResult>;
    delete(id: number): Promise<DeleteResult>;
}
