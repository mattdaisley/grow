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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialService = void 0;
const common_1 = require("@nestjs/common");
const serialport_1 = require("serialport");
let SerialService = class SerialService {
    constructor() {
        this.paths = ['/dev/ttyACM0', '/dev/cu.usbmodem14101'];
        this.currentPathIndex = 0;
        this.pumpsReady = false;
        this.createSerialPort();
    }
    createSerialPort() {
        const self = this;
        self.port = null;
        self.pumpsReady = false;
        const port = new serialport_1.SerialPort({
            path: self.paths[self.currentPathIndex],
            baudRate: 115200,
            autoOpen: false,
        });
        port.open((err) => {
            if (err) {
                self.currentPathIndex = self.currentPathIndex === self.paths.length - 1 ? 0 : self.currentPathIndex + 1;
                return console.log('Error opening port: ', err.message);
            }
            port.flush();
            self.port = port;
            const parser = new serialport_1.ReadlineParser({ delimiter: '\n' });
            self.port.pipe(parser);
            parser.on('data', data => {
                if (!self.pumpsReady && data.includes('first_message_sent == false')) {
                    console.log("Data includes first message:", data);
                    self.pumpsReady = true;
                }
                self.handlePortData(data);
            });
        });
    }
    isPortOpen() {
        if (!this.port) {
            return false;
        }
        return this.port.isOpen;
    }
    isPortReady() {
        return this.pumpsReady;
    }
    handlePortData(data) {
    }
    async write(message) {
        console.log("isPortOpen", this.isPortOpen());
        if (!this.isPortOpen()) {
            this.createSerialPort();
            await this.sleep(5000);
        }
        console.log("isPortReady", this.isPortReady(), this.pumpsReady);
        if (!this.isPortReady()) {
            await this.sleep(1000);
            return;
        }
        this.port.write(message, (err) => {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            console.log('message written:', message);
        });
    }
    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
};
SerialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SerialService);
exports.SerialService = SerialService;
//# sourceMappingURL=serial.service.js.map