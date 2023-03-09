import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { exec } from 'child_process'
import { io, Socket } from "socket.io-client";

@Injectable()
export class GpioService {

    private Socket: Socket

    public DeviceSerial: string;

    public DeviceName: string;

    constructor(
        private configService: ConfigService
    ) {
        this.initialize();
    }

    @Cron('*/60 * * * * *')
    private async handleCron() {
        await this.handleDiscoverEvent()
    }

    private async initialize(): Promise<void> {

        console.log('GpioService initializing...')

        await this.setDeviceInfo()
        console.log(`GpioService initialized DeviceName: ${this.DeviceName}`);

        const websocketHost = this.configService.get<string>('WEBSOCKET_HOST');
        this.Socket = io(websocketHost)
        this.Socket.on(`connect`, this.handleConnectEvent.bind(this));
        this.Socket.on(`discover`, this.handleDiscoverEvent.bind(this));
    }

    private async handleConnectEvent(): Promise<void> {

        console.log(`GpioService Socket id: '${this.Socket?.id}' connected: ${this.Socket?.connected}`); 
    }

    private async handleDiscoverEvent(): Promise<void> {

        const socket = this.Socket

        if (!socket?.connected) {
            return;
        }

        try {
            const itemKey = 'gpio-device'
            const valueKey = `${itemKey}.${this.DeviceSerial}.device`

            const setItemsEvent = { [itemKey]: { [valueKey]: this.DeviceName } }
            
            socket.emit(itemKey, setItemsEvent)
        }
        catch(error) {
            console.log('error:', error)
        }

    }

    private async setDeviceInfo(): Promise<void> {
        const self = this;

        return new Promise<void>((resolve, reject) => {
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
        })
    }
}
