import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { exec } from 'child_process'
import { io, Socket } from "socket.io-client";
import { BinaryValue, Gpio } from 'onoff';
import * as fs from 'fs/promises'

@Injectable()
export class GpioService implements OnModuleDestroy {

    private Socket: Socket

    public DeviceSerial: string;

    public DeviceName: string;

    private GpioConfiguration: any = undefined

    private AutomationInterval: NodeJS.Timer;

    constructor(
        private configService: ConfigService
    ) {
        const self = this;

        this.initialize();

        this.AutomationInterval = setInterval(self.handleAutomationCron.bind(self), 500)
    }

    onModuleDestroy() {
        const self = this;

        console.log(`The module is being destroyed.`);

        clearInterval(this.AutomationInterval)

        if (this.GpioConfiguration?.GpioPins === undefined) {
            return;
        }

        Object.keys(this.GpioConfiguration.GpioPins).forEach(pin => {
            let gpio = self.GpioConfiguration.GpioPins[pin]

            if (gpio === undefined) {
                if (Gpio.accessible) {
                    gpio = new Gpio(Number(pin), 'out')
                }
            }

            if (gpio !== undefined) {
                self.SetGpio(pin, 0)
                self.SendAddItems(pin, '0')
                
                console.log(pin, 'unexport')
                gpio.unexport()
            }
        })
    }

    private SetGpio(pin, newState) {
        let gpio: Gpio = this.GpioConfiguration.GpioPins[pin]
        const savedOnState = this.GpioConfiguration.GpioPinsOnState[pin];

        if (gpio === undefined) {
            if (Gpio.accessible) {
                gpio = new Gpio(Number(pin), 'out')
                this.GpioConfiguration.GpioPins[pin] = gpio
            }
        }
        
        let value: BinaryValue;
        if (savedOnState === 1) {
            value = newState ? 1 : 0
        }
        if (savedOnState === 0) {
            value = newState ? 0 : 1
        }
        console.log(new Date().toISOString(), 'write gpio', pin, value)

        if (gpio === undefined || savedOnState === undefined) {
            return;
        }

        gpio.writeSync(value);
    }

    @Cron('5 * * * * *')
    private async handleDiscoverCron() {
        await this.handleDiscoverEvent()
    }

    private async handleAutomationCron() {
        // console.log('handleAutomationCron')
        var currentTime = new Date();

        if (!this.Socket?.connected) {
            return;
        }

        if (this.GpioConfiguration?.GpioPinsAutomation === undefined) {
            await this.loadSavedPinConfiguration()
            return;
        }

        Object.keys(this.GpioConfiguration.GpioPinsAutomation).forEach(pin => {
            const automation = this.GpioConfiguration.GpioPinsAutomation[pin]
            const type = automation.type
            const timeOn = automation.time_on
            const timeOff = automation.time_off
            const lastChangeTime = automation.last_change_time
            const lastState = automation.last_state ?? 0

            if (type.toLowerCase() === 'interval') {

                if (Number(lastState) === 0) {
                    var timeToTurnOn = new Date(lastChangeTime);
                    timeToTurnOn.setSeconds(timeToTurnOn.getSeconds() + Number(timeOff));

                    // console.log(currentTime.getTime(), type, lastState, timeOff, timeToTurnOn.getTime())
                    if (currentTime.getTime() > timeToTurnOn.getTime()) {
                        // turn on
                        this.SetGpio(pin, 1)
                        automation.last_state = '1'
                        automation.last_change_time = currentTime.toISOString()
                        this.SendAddItems(pin, '1')
                    }
                }
                
                if (Number(lastState) === 1) {
                    var timeToTurnOff = new Date(lastChangeTime);
                    timeToTurnOff.setSeconds(timeToTurnOff.getSeconds() + Number(timeOn));

                    // console.log(currentTime.getTime(), type, lastState, timeOn, timeToTurnOff.getTime())
                    if (currentTime.getTime() > timeToTurnOff.getTime()) {
                        // turn off
                        this.SetGpio(pin, 0)
                        automation.last_state = '0'
                        automation.last_change_time = currentTime.toISOString()
                        this.SendAddItems(pin, '0')
                    }
                }
            }

            if (type.toLowerCase() === 'schedule') {

            }

        });
    }

    private async initialize(): Promise<void> {
        const self = this;

        console.log('GpioService initializing...')

        await this.setDeviceInfo()
        console.log(`GpioService initialized DeviceName: ${this.DeviceName}`);

        const websocketHost = this.configService.get<string>('WEBSOCKET_HOST');
        this.Socket = io(websocketHost)
        this.Socket.on(`connect`, self.handleConnectEvent.bind(self));
        this.Socket.on(`discover`, self.handleDiscoverEvent.bind(self));
        this.Socket.on(`gpio-command`, self.handleGpioCommand.bind(self));
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

    private async loadSavedPinConfiguration(): Promise<void> {
        const self = this; 

        this.GpioConfiguration = {
            GpioPins: {},
            GpioPinsOnState: {},
            GpioPinsStartupState: {},
            GpioPinsAutomation: {},
            SelectedItemValueKeys: {},
            OutputStateValueKeys: {},
        }

        try {
            const data = await fs.readFile('pin-configuration.json', 'utf8')

            if (data !== undefined) {
                this.GpioConfiguration = {...this.GpioConfiguration, ...JSON.parse(data) }
                Object.keys(this.GpioConfiguration.GpioPinsAutomation).forEach(pin => {
                    if (Gpio.accessible) {
                        const gpio = new Gpio(Number(pin), 'out')
                        self.GpioConfiguration.GpioPins[pin] = gpio
                    }

                    this.GpioConfiguration.GpioPinsAutomation[pin].last_change_time = new Date().toISOString()

                    if (this.GpioConfiguration.GpioPinsStartupState[pin] === '0') {
                        self.SetGpio(pin, 0)
                        this.GpioConfiguration.GpioPinsAutomation[pin].last_state = '0'
                        this.SendAddItems(pin, '0')
                    }

                    if (this.GpioConfiguration.GpioPinsStartupState[pin] === '1') {
                        self.SetGpio(pin, 1)
                        this.GpioConfiguration.GpioPinsAutomation[pin].last_state = '1'
                        this.SendAddItems(pin, '1')
                    }
                })

                console.log(this.GpioConfiguration);  
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    private async savePinConfigration(): Promise<void> {
        try {
            const pinConfig = { ...this.GpioConfiguration }
            Object.keys(pinConfig.GpioPins).forEach(pin => pinConfig.GpioPins[pin] = undefined)

            const str = JSON.stringify(pinConfig, null, 2);
            await fs.writeFile('pin-configuration.json', str, 'utf8');
        } catch (error) {
            
        }
    }

    private async handleGpioCommand(event) {
        console.log(event)
        const self = this;

        let matchesDevice: boolean = false;
        let pin: string = undefined;
        let startupState: string = undefined;
        let onState: Number = undefined;
        let newState: string = undefined;
        const automation: any = {};

        let selectedItemValueKey: { ItemKey: string, Name: string, ValueKey: string } = { ItemKey: undefined, Name: undefined, ValueKey: undefined };
        let outputStateValueKey: string;

        let collectionItemKey = Object.keys(event)[0]

        selectedItemValueKey.ItemKey = collectionItemKey;
        event[collectionItemKey].data.forEach(dataItem => {

            const { item, value } = dataItem;
            // console.log(item, value)

            if (item.valueKey.includes('select_outlet')) {
                selectedItemValueKey.Name = 'select_outlet' 
                selectedItemValueKey.ValueKey = item.value
            }
            if (item.valueKey.includes('selected_nutrient_pump')) {
                selectedItemValueKey.Name = 'selected_nutrient_pump' 
                selectedItemValueKey.ValueKey = item.value
            }
            if (item.valueKey.includes('output_state')) {
                outputStateValueKey = item.value
            }

            if (value?.device_field?.device === this.DeviceName) {
                matchesDevice = true
            }
            if (value?.output_pin !== undefined && !Number.isNaN(Number(value.output_pin))) {
                pin = value.output_pin
            }
            if (value?.startup_state?.on_off.toLowerCase() === 'on') {
                startupState = '1'
            }
            if (value?.startup_state?.on_off.toLowerCase() === 'off') {
                startupState = '0'
            }
            if (value?.on_state?.gpio_high_low.toLowerCase() === 'high') {
                onState = 1
            }
            if (value?.on_state?.gpio_high_low.toLowerCase() === 'low') {
                onState = 0
            }
            if (value?.on_off === 'On') {
                newState = '1'
            }
            if (value?.on_off === 'Off') {
                newState = '0'
            }
            if (value?.automation_type !== undefined) {
                automation.type = value.automation_type.automation_type_name
            }
            if (value?.time_on !== undefined) {
                automation.time_on = value.time_on
            }
            if (value?.time_off !== undefined) {
                automation.time_off = value.time_off
            }
        });

        // console.log(matchesDevice, pin, onState, newState)
        if (matchesDevice && ![pin, onState, newState].includes(undefined)) {

            if (selectedItemValueKey !== undefined) {
                this.GpioConfiguration.SelectedItemValueKeys[pin] = selectedItemValueKey
            }
            if (outputStateValueKey !== undefined) {
                this.GpioConfiguration.OutputStateValueKeys[newState] = outputStateValueKey
            }

            let gpio = self.GpioConfiguration.GpioPins[pin]
            if (gpio === undefined) {
                if (Gpio.accessible) {
                    gpio = new Gpio(Number(pin), 'out')
                    self.GpioConfiguration.GpioPins[pin] = gpio
                }
            }

            this.GpioConfiguration.GpioPinsStartupState[pin] = startupState
            this.GpioConfiguration.GpioPinsOnState[pin] = onState

            self.SetGpio(pin, Number(newState))

            automation.last_state = newState
            automation.last_change_time = Date.now()

            this.GpioConfiguration.GpioPinsAutomation[pin] = automation

            this.savePinConfigration()
        }
    }

    private SendAddItems(pin, value) {

        const socket = this.Socket

        if (!socket?.connected) {
            return;
        }

        try {
            const event = 'add-items'

            const selectedItem = this.GpioConfiguration.SelectedItemValueKeys[pin]

            const itemKey = selectedItem.ItemKey

            const items = { [itemKey]: {
                [selectedItem.Name]: selectedItem.ValueKey,
                'output_state': this.GpioConfiguration.OutputStateValueKeys[value]
            }}
            
            const addItemsEvent = { itemKey, items, 'automation': false };
            // console.log(addItemsEvent)
            socket.emit(event, addItemsEvent)

            /*
            handleAddItemsEvent {
                itemKey: 'preview_collections_2f88f0f2-b775-468c-aaf6-8bd12396125a',
                items: {
                    'preview_collections_2f88f0f2-b775-468c-aaf6-8bd12396125a': {
                        select_outlet: 'preview_collections_570c9f24-3409-413b-ab8d-6aaa610ca58f.cb3fb030-dbac-413f-8563-cda3a3ed7683',  // main pump
                        select_outlet: 'preview_collections_570c9f24-3409-413b-ab8d-6aaa610ca58f.36ab6038-a4ce-4048-b882-abba113d5cae',  // overhead lights
                        select_outlet: 'preview_collections_570c9f24-3409-413b-ab8d-6aaa610ca58f.5e680fa3-803d-4543-a51b-9229758c6e2e',  // nutrient pump
                        select_outlet: 'preview_collections_570c9f24-3409-413b-ab8d-6aaa610ca58f.da586684-5be2-4d21-84b3-e4653d6990c6',  // fan

                        output_state: 'preview_collections_3077da3a-37aa-439a-ac3a-8d7c9e2a7cfa.af41b37a-2384-4160-bdc5-81fefea1eace'    // off
                        output_state: 'preview_collections_3077da3a-37aa-439a-ac3a-8d7c9e2a7cfa.6b992f97-66a3-4d85-b692-bb731777b7c8'    // on
                    }
                }
            }
            */
        }
        catch(error) {
            console.log('error:', error)
        }
    }
}
