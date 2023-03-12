import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { exec } from 'child_process'
import { io, Socket } from "socket.io-client";
import { BinaryValue, Gpio } from 'onoff';

@Injectable()
export class GpioService implements OnModuleDestroy {

    private Socket: Socket

    public DeviceSerial: string;

    public DeviceName: string;

    private GpioPins: Map<string, Gpio> = new Map();

    private GpioPinsOnState: Map<string, Number> = new Map();

    constructor(
        private configService: ConfigService
    ) {
        this.initialize();
    }

    onModuleDestroy() {
        console.log(`The module is being destroyed.`);
        this.GpioPins.forEach((gpio, pin) => {
            let value: BinaryValue = 0
            const savedOnState = this.GpioPinsOnState.get(pin);
            if (savedOnState !== undefined) {
                if (savedOnState === 1) {
                    value = 1
                }
                if (savedOnState === 0) {
                    value = 0
                }
            }

            console.log(pin, savedOnState, value)
            gpio.writeSync(value);

            console.log(pin, 'unexport')
            gpio.unexport()
        })
    }

    @Cron('5 * * * * *')
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
        this.Socket.on(`gpio-command`, this.handleGpioCommand.bind(this));
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

    private async handleGpioCommand(values) {
        let matchesDevice = false;
        let pin = undefined;
        let onState = undefined;
        let newState = undefined;

        values.forEach(value => {
            // console.log(value)
            if (value?.device_field?.device === this.DeviceName) {
                matchesDevice = true
            }
            if (value?.output_pin !== undefined && !Number.isNaN(Number(value.output_pin))) {
                pin = value.output_pin
            }
            if (value?.on_state?.gpio_high_low.toLowerCase() === 'high') {
                onState = 1
            }
            if (value?.on_state?.gpio_high_low.toLowerCase() === 'low') {
                onState = 0
            }
            if (value?.on_off === 'On') {
                newState = 1
            }
            if (value?.on_off === 'Off') {
                newState = 0
            }
        });

        console.log(matchesDevice, pin, onState, newState)
        if (matchesDevice && ![pin, onState, newState].includes(undefined)) {

            let gpio = this.GpioPins.get(pin)
            if (gpio === undefined) {
                gpio = new Gpio(Number(pin), 'out')
                this.GpioPins.set(pin, gpio)
            }

            let pinOnState = this.GpioPinsOnState.get(pin)
            if (pinOnState === undefined) {
                pinOnState = onState
                this.GpioPinsOnState.set(pin, pinOnState)
            }

            let value: BinaryValue;
            if (pinOnState === 1) {
                value = newState ? 1 : 0
            }
            if (pinOnState === 0) {
                value = newState ? 0 : 1
            }
            gpio.writeSync(value)
        }
    }
}
