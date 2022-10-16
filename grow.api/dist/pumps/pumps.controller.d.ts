import { PumpsService } from './pumps.service';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
export declare class PumpsController {
    private readonly pumpsService;
    constructor(pumpsService: PumpsService);
    create(createPumpDto: CreatePumpDto): import("./entities/pump.entity").Pump;
    findAll(): import("./entities/pump.entity").Pump[];
    findOne(id: string): import("./entities/pump.entity").Pump;
    update(id: string, updatePumpDto: UpdatePumpDto): import("./entities/pump.entity").Pump;
    remove(id: string): void;
}
