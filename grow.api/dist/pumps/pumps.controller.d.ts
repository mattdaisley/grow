import { PumpsService } from './pumps.service';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
export declare class PumpsController {
    private readonly pumpsService;
    constructor(pumpsService: PumpsService);
    create(createPumpDto: CreatePumpDto): Promise<import("./entities/pump.entity").Pump>;
    findAll(): Promise<import("./entities/pump.entity").Pump[]>;
    findOne(id: string): Promise<import("./entities/pump.entity").Pump>;
    update(id: string, updatePumpDto: UpdatePumpDto): Promise<import("typeorm").UpdateResult>;
    delete(id: string): Promise<import("typeorm").DeleteResult>;
}
