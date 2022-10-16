import { Injectable } from '@nestjs/common';
import { SerialPort, ReadlineParser } from 'serialport'

@Injectable()
export class SerialService {

    private port: SerialPort;

    private paths: string[] = ['/dev/ttyACM0', '/dev/cu.usbmodem14101'];
    private currentPathIndex: number = 0;
    private pumpsReady: boolean = false;
  
    constructor() { 
        this.createSerialPort();
    }

    private createSerialPort(): void {
        const self = this;

        self.port = null;
        self.pumpsReady = false;

        const port = new SerialPort({
            // path: '/dev/ttyACM0',
            path: self.paths[self.currentPathIndex],
            baudRate: 115200,
            autoOpen: false,
        });

        port.open((err) => {
            if (err) {
                self.currentPathIndex = self.currentPathIndex === self.paths.length - 1 ? 0 : self.currentPathIndex + 1;

                return console.log('Error opening port: ', err.message)
            }
            
            port.flush();

            self.port = port;

            const parser = new ReadlineParser({ delimiter: '\n' });
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

    private isPortOpen(): boolean {
        if (!this.port) {
            return false;
        }

        return this.port.isOpen;
    }

    private isPortReady(): boolean {
        return this.pumpsReady;
    }

    private handlePortData(data: string): void {

        // Do other things
    }

    public async write(message: string): Promise<void> {
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

    private sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
