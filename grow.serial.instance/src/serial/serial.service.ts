import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SerialPort, ReadlineParser } from 'serialport'

@Injectable()
export class SerialService {

    private port: SerialPort;

    private paths: string[] = ['/dev/ttyACM0', '/dev/cu.usbmodem14101'];
    private currentPathIndex: number = 0;
    private pumpsReady: boolean = false;
  
    constructor(
        @InjectQueue('serial') private readonly serialQueue: Queue
    ) {
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

        console.log(`Opening port: ${self.paths[self.currentPathIndex]}`)
        port.open(async (err) => {
            if (err) {
                console.log('Error opening port: ', err.message)

                if (self.currentPathIndex === self.paths.length - 1) {
                    self.currentPathIndex = 0;
                }
                else {
                    self.currentPathIndex = self.currentPathIndex + 1;
                    self.createSerialPort();
                }

                return;
            }
            
            port.flush();

            self.port = port;

            const parser = new ReadlineParser({ delimiter: '\n' });
            self.port.pipe(parser);

            await this.serialQueue.add('sent', {
                message: `Port opened!`
            });

            parser.on('data', data => {
                // console.log('data:', data);

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

    private async handlePortData(data: string): Promise<void> {
        if (!this.pumpsReady && data.includes('H/P/0/0')) {
            console.log("Data includes first message:", data);
            this.pumpsReady = true;
        }
        // console.log('received', data);
        await this.serialQueue.add('receive', {
            message: data,
        });
        // Do other things
    }

    public async write(message: string): Promise<void> {
        await this.serialQueue.add('sent', {
            message: `sent: ${message}`
        });

        // console.log("isPortOpen", this.isPortOpen());
        if (!this.isPortOpen()) {

            await this.serialQueue.add('sent', {
                message: `Opening serial port...`
            });

            this.createSerialPort();
            await this.sleep(5000);
        }

        // console.log("isPortReady", this.isPortReady(), this.pumpsReady);
        if (!this.isPortReady()) {

            await this.serialQueue.add('sent', {
                message: `Port is not ready. Try again in 1 second.`
            });

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