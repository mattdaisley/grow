import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { Pump } from './entities/pump.entity';
export declare class PumpsService {
    private readonly pumps;
    create(createPumpDto: CreatePumpDto): Pump;
    findAll(): Pump[];
    findOne(index: number): Pump;
    update(index: number, updatePumpDto: UpdatePumpDto): Pump;
    remove(index: number): void;
}
