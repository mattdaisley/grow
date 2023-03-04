import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
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

    private async initialize(): Promise<void> {
        const self = this;

        console.log('GpioService initialize')
        
        const itemKey = 'gpio-device'

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

                    const setItemsEvent = { [itemKey]: { [`${itemKey}.${serial}.device`]: self.DeviceName } }

                    await self.gpioQueue.add('discover-device', {
                        message: setItemsEvent
                    });
                });
                return;
            }
            
            console.log(`stdout: ${stdout}`);

            const serial = stdout.trim().replace('"', '').replace('"', '')

            self.DeviceSerial = serial
            self.DeviceName = `raspi - ${serial}`

            const setItemsEvent = { [itemKey]: { [`${itemKey}.${serial}.device`]: self.DeviceName } }

            await self.gpioQueue.add('discover-device', {
                message: setItemsEvent
            });
        });
    }
}
