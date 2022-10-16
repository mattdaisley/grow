"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const pump_entity_1 = require("./entities/pump.entity");
const serial_service_1 = require("../serial/serial.service");
let PumpsService = class PumpsService {
    constructor(pumpRepository, serialService) {
        this.pumpRepository = pumpRepository;
        this.serialService = serialService;
    }
    async create(createPumpDto) {
        return await this.pumpRepository.save((0, class_transformer_1.plainToClass)(pump_entity_1.Pump, createPumpDto));
    }
    async findAll() {
        return await this.pumpRepository.find();
    }
    async findOne(id) {
        const pump = await this.pumpRepository.findOneBy({ id });
        console.log(pump);
        if (pump) {
            const message = `H/P/${pump.index}/1\n`;
            await this.serialService.write(message);
        }
        return pump;
    }
    async update(id, updatePumpDto) {
        return await this.pumpRepository.update(id, (0, class_transformer_1.plainToClass)(pump_entity_1.Pump, updatePumpDto));
    }
    async delete(id) {
        return await this.pumpRepository.delete(id);
    }
};
PumpsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pump_entity_1.Pump)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        serial_service_1.SerialService])
], PumpsService);
exports.PumpsService = PumpsService;
//# sourceMappingURL=pumps.service.js.map