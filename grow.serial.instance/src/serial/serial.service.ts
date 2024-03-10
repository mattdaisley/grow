import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from "socket.io-client";
import { SerialPort, ReadlineParser } from 'serialport'
import { exec } from 'child_process';

@Injectable()
export class SerialService {

    private Socket: Socket

    public DeviceSerial: string;

    public DeviceName: string;

    private port: SerialPort;

    private paths: string[] = ['COM3', '/dev/cu.usbmodem14101'];
    private currentPathIndex: number = 0;
    private portReady: boolean = false;

    lastCommandStatus: string = 'ok';
    command_queue: string[] = [];

    private AutomationInterval: NodeJS.Timer;
  
    constructor(
        private configService: ConfigService
    ) {
        this.createSerialPort();

        const self = this;

        this.initializeSocket();

        this.AutomationInterval = setInterval(self.handleAutomationCron.bind(self), 200)
    }

    private async queueCommand(command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.command_queue.push(command);
            resolve()
        });
    }

    private async handleAutomationCron(): Promise<void> {
        console.log('handleAutomationCron', this.command_queue.length, this.lastCommandStatus)
        if (this.command_queue.length > 0 && this.lastCommandStatus === 'ok') {
            const command = this.command_queue[0];
            this.lastCommandStatus = 'waiting';
            await this.write(command);
        }
        else {
            await this.write('?\n')
        }
    }

    private createSerialPort(): void {
        const self = this;

        self.port = null;
        self.portReady = false;

        console.log(`Opening port: ${self.paths[self.currentPathIndex]}`)

        const port = new SerialPort({
            // path: '/dev/ttyACM0',
            path: self.paths[self.currentPathIndex],
            baudRate: 115200,
            autoOpen: false,
        });
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

            console.log(`Port opened`)
            
            port.flush();

            self.port = port;

            const parser = new ReadlineParser({ delimiter: '\n' });
            self.port.pipe(parser);

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
        return this.portReady;
    }

    private async handlePortData(data: string): Promise<void> {
        console.log('received:', data);

        const self = this;

        if (data.includes('ALARM:1')) {
            self.portReady = false;

            self.port.close((err) => {
                if (err) {
                    return console.log('Error closing port: ', err.message)
                }
                console.log('Port closed')

                self.createSerialPort();
            })
        }

        if (!this.portReady && data.includes('Grbl')) {
            this.portReady = true;

            await this.write('$$\n')
            await this.write('$G\n')
            await this.write('$X\n')
            await this.write('$H\n')
            await this.write('G90\n')
            await this.write('F4000\n')
            await this.write('G10 P0 L20 X0\n')
            await this.write('G10 P0 L20 Y0\n')
            await this.write(`G1 X${this.X_OFFSET} Y${this.Y_OFFSET}\n`)
            await this.write('G10 P0 L20 X0\n')
            await this.write('G10 P0 L20 Y0\n')
            await this.write(`M03`);
        }

        if (data.includes('<Idle|')) {
            this.lastCommandStatus = 'ok';
            if (this.command_queue.length > 0) {
                this.command_queue.shift();
            }
        }
    }

    private async initializeSocket(): Promise<void> {
        const self = this;

        console.log('SerialService initializing...')

        await this.setDeviceInfo()
        console.log(`SerialService initialized DeviceName: ${this.DeviceName}`);

        const websocketHost = this.configService.get<string>('WEBSOCKET_HOST');
        this.Socket = io(websocketHost)
        this.Socket.on(`connect`, self.handleConnectEvent.bind(self));
        this.Socket.on(`discover`, self.handleDiscoverEvent.bind(self));
        this.Socket.on(`serial-command`, self.handleSerialCommand.bind(self));
    }

    private async handleConnectEvent(): Promise<void> {

        console.log(`SerialService Socket id: '${this.Socket?.id}' connected: ${this.Socket?.connected}`); 
    }

    private async handleDiscoverEvent(): Promise<void> {

        const socket = this.Socket

        if (!socket?.connected) {
            return;
        }

        try {
            const itemKey = 'serial-device'
            const valueKey = `${itemKey}.${this.DeviceSerial}.device`

            const setItemsEvent = { [itemKey]: { [valueKey]: this.DeviceName } }
            
            socket.emit(itemKey, setItemsEvent)
        }
        catch(error) {
            console.log('error:', error)
        }

    }

    private async handleSerialCommand(event): Promise<void> {
        console.log(JSON.stringify(event, null, 2))

        let collectionItemKey = Object.keys(event)[0]
        event[collectionItemKey].data.forEach(async dataItem => {

            await this.movePiece(dataItem);
        });
    }

    SQUARE_SIZE = 40;
    X_DIR = -1;
    Y_DIR = 1;
    X_OFFSET = 0;
    Y_OFFSET = 0;
    DRAG_MODIFIER = 5;


    private async movePiece(dataItem: any) {
        const { item, value } = dataItem;
        console.log(item, value)
        let startPiece;
        let startX;
        let startY;
        let endX;
        let endY;
        let capture;

        if (value?.startPiece !== undefined) {
            startPiece = value.startPiece;
        }

        if (value?.start_square !== undefined) {
            let [startRow, startCol] = this.getRowColFromSquareName(value.start_square);

            console.log(`startRow: ${startRow}, startCol: ${startCol}`);

            startX = (9 - (startRow + 1)) * this.SQUARE_SIZE * this.X_DIR;
            startY = (startCol + 1) * this.SQUARE_SIZE * this.Y_DIR;

            // a2 = 0,6 = x=-80, y=40
            // x = -80 = 2 * 40 * -1 = (9 - (6+1)) * 40 * -1
            // y = 40  = 1 * 40 * 1  
        }

        if (value?.end_square !== undefined) {
            let [endRow, endCol] = this.getRowColFromSquareName(value.end_square);

            console.log(`endRow: ${endRow}, endCol: ${endCol}`);

            endX = (9 - (endRow + 1)) * this.SQUARE_SIZE * this.X_DIR;
            endY = (endCol + 1) * this.SQUARE_SIZE * this.Y_DIR;

            // a3 = 0,5 = x=-120, y=40
            // x = -120 = 3 * 40 * -1 = (9 - (5+1)) * 40 * -1
            // y = 40  = 1 * 40 * 1  
            // a4 = 0,4 = x=-160, y=40
            // x = -160 = 4 * 40 * -1 = (9 - (4+1)) * 40 * -1
            // y = 40  = 1 * 40 * 1 
        }

        if (value?.capture !== undefined) {
            capture = value.capture;
        }

        console.log({startPiece, startX, startY, endX, endY})

        if (startPiece !== undefined && startX !== undefined && startY !== undefined && endX !== undefined && endY !== undefined) {

            const directionX = endX === startX ? 0 : endX > startX ? 1 : -1;
            const directionY = endY === startY ? 0 : endY > startY ? 1 : -1;

            // Pick up the start piece
            await this.moveToCorner(startX, startY, 0, 0);
            await this.queueCommand(`M04`);

            // Move the start piece to the corner of the end square
            switch (startPiece) {
                case '♞':
                case '♘':
                    await this.moveToCorner(startX, startY, directionX, directionY);
                    await this.moveToCorner(endX, endY, directionX * -1, directionY * -1);
                    break;
                case '♛':
                case '♕':
                case '♚':
                case '♔':
                case '♜':
                case '♖':
                case '♝':
                case '♗':
                    await this.moveToCorner(endX, endY, directionX * -1, directionY * -1);
                    break;
                case '♟':
                case '♙':
                    if (capture === '1') {
                        await this.moveToCorner(endX, endY, directionX * -1, directionY * -1);
                    }
                    break;
            }

            if (capture === '1') {
                // Drop the start piece
                await this.queueCommand(`M03`);

                 // Move to the end piece
                await this.moveToCorner(endX, endY, 0, 0);

                 // Pick up the end piece
                await this.queueCommand(`M04`);

                // Move the captured piece to the edge of the board
                await this.queueCommand(`G1 X${endX + 20 * directionX} Y${endY - 20 * directionY}\n`);
                await this.queueCommand(`G1 X${endX + 20 * directionX} Y${0}\n`);
                await this.queueCommand(`G1 X${endX} Y${0}\n`);

                // Drop the captured piece
                await this.queueCommand(`M03`);

                // Go back to the corner of the end square
                await this.moveToCorner(endX, endY, directionX * -1, directionY * -1);

                // Pick up the start piece
                await this.queueCommand(`M04`); 
            }

            // Move the start piece to the end square
            await this.moveToCorner(endX, endY, 0, 0);
            await this.queueCommand(`G1 X${endX} Y${endY}\n`);

            // Drop the start piece
            await this.queueCommand(`M03`);

        }
    }

    private async moveToCorner(squareX: number, squareY: number, directionX: number, directionY: number): Promise<void> {
        let x = squareX + 20 * directionX;
        let y = squareY + 20 * directionY;

        await this.queueCommand(this.getG1Command(x, y));
    }

    private getG1Command(x: number, y: number): string {
        return `G1 X${x} Y${y}\n`
    }

    private getRowColFromSquareName(squareName: string) {
        const file = squareName[0];
        const rank = squareName[1];
        const col = file.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = 8 - parseInt(rank);
        return [row, col];
    }

    private async setDeviceInfo(): Promise<void> {
        const self = this;

        return new Promise<void>((resolve, reject) => {

            if (process.platform === 'win32') {
                exec(`wmic csproduct get IdentifyingNumber`, async (error, stdout, stderr) => {
                    const serial = stdout.trim().split('\r\n')[1]

                    self.DeviceSerial = serial
                    self.DeviceName = `win - ${serial}`
                    resolve();
                });
            }
            else {

                exec(`cat /proc/cpuinfo | grep Serial | cut -d ":" -f2`, async (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        reject(error);
                        return;
                    }
                    if (stderr) {
                        exec(`ioreg -l | grep IOPlatformSerialNumber | cut -d "=" -f2`, async (error, stdout, stderr) => {
                            if (error) {
                                console.log(`error: ${error.message}`);
                                reject(error);
                                return;
                            }
                            if (stderr) {
                                console.log(`stderr: ${stderr}`);
                                reject(error);
                                return;
                            }

                            const serial = stdout.trim().replace('"', '').replace('"', '')

                            self.DeviceSerial = serial
                            self.DeviceName = `mac - ${serial}`
                            resolve();
                        });
                        return;
                    }
                    
                    const serial = stdout.trim().replace('"', '').replace('"', '')

                    self.DeviceSerial = serial
                    self.DeviceName = `raspi - ${serial}`
                    resolve();
                });
            }
        })
    }

    public async write(message: string): Promise<void> {
        // console.log("isPortOpen", this.isPortOpen());
        if (!this.isPortOpen()) {

            console.log('Opening serial port...')

            this.createSerialPort();
            await this.sleep(5000);
        }

        // console.log("isPortReady", this.isPortReady(), this.pumpsReady);
        if (!this.isPortReady()) {

            console.log('Port is not ready. Try again in 1 second.')

            await this.sleep(1000);
            return;
        }

        console.log('sending:', message.replace('\n', ''));
        this.port.write(message, (err) => {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            // console.log('message written:', message);
        });
    }

    private sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
