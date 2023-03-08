import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { exec } from 'child_process'

@Injectable()
export class GpioService {

    constructor(
        @InjectQueue('gpio') private readonly gpioQueue: Queue
    ) {
        this.initialize();
    }

    public DeviceSerial: string;

    public DeviceName: string;

    @Cron('*/5 * * * * *')
    private async handleCron() {
        await this.emitDiscoverDevice()
    }

    public async emitDiscoverDevice(): Promise<void> {
        const self = this;
        try {
            const itemKey = 'gpio-device'

            const setItemsEvent = { [itemKey]: { [`${itemKey}.${this.DeviceSerial}.device`]: this.DeviceName } }
            
            console.log('emitDiscoverDevice setItemsEvent', setItemsEvent)

            await self.gpioQueue.add('discover-device', {
                message: setItemsEvent
            });
        }
        catch( error) {
            console.log(error)
        }
    }

    private async initialize(): Promise<void> {
        const self = this;

        console.log('GpioService initialize')

        exec(`cat /proc/cpuinfo | grep Serial | cut -d ":" -f2`, async (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                exec(`ioreg -l | grep IOPlatformSerialNumber | cut -d "=" -f2`, async (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);

                    const serial = stdout.trim().replace('"', '').replace('"', '')

                    self.DeviceSerial = serial
                    self.DeviceName = `mac - ${serial}`

                    await self.emitDiscoverDevice()
                });
                return;
            }
            
            console.log(`stdout: ${stdout}`);

            const serial = stdout.trim().replace('"', '').replace('"', '')

            self.DeviceSerial = serial
            self.DeviceName = `raspi - ${serial}`

            await self.emitDiscoverDevice()
        });
    }
}
