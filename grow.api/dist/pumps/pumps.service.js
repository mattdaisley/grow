"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpsService = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const pump_entity_1 = require("./entities/pump.entity");
let PumpsService = class PumpsService {
    constructor() {
        this.pumps = [];
    }
    create(createPumpDto) {
        const pumpIndex = this.pumps.findIndex(pump => pump.index === createPumpDto.index);
        if (pumpIndex < 0) {
            this.pumps.push((0, class_transformer_1.plainToClass)(pump_entity_1.Pump, createPumpDto));
        }
        return this.pumps.find(pump => pump.index === createPumpDto.index);
    }
    findAll() {
        return this.pumps;
    }
    findOne(index) {
        return this.pumps.find(pump => pump.index === index);
    }
    update(index, updatePumpDto) {
        const pumpIndex = this.pumps.findIndex(pump => pump.index === updatePumpDto.index);
        this.pumps[pumpIndex] = (0, class_transformer_1.plainToClass)(pump_entity_1.Pump, (0, class_transformer_1.instanceToPlain)(updatePumpDto));
        return this.pumps.find(pump => pump.index === updatePumpDto.index);
    }
    remove(index) {
        const pumpIndex = this.pumps.findIndex(pump => pump.index === index);
        this.pumps.splice(pumpIndex, 1);
    }
};
PumpsService = __decorate([
    (0, common_1.Injectable)()
], PumpsService);
exports.PumpsService = PumpsService;
//# sourceMappingURL=pumps.service.js.map