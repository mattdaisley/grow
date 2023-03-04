import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { DynamicService } from '../dynamic/dynamic.service';
import { DynamicGateway } from '../dynamic/dynamic.gateway';
import { GpioService } from './gpio.service';

@Processor('gpio')
export class GpioProcessor {

  constructor(
    private readonly dynamicGateway: DynamicGateway,
    private readonly dynamicService: DynamicService,
    private readonly gpioService: GpioService,
  ){
    setTimeout(() => {
      this.gpioService.emitDiscover()
    }, 3000)
  }

  @Process('discover-device')
  async handleDiscoverDeviceMessage(job: Job) {
    const self = this;

    try {
      const message = job.data.message

      console.log('handleDiscoverDeviceMessage', message)

      const event = `items-gpio-device`;
      //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };
      const addedItems = await this.dynamicService.saveItems(message)


      console.log('handleDiscoverDeviceMessage emit', addedItems)
      self.dynamicGateway.emitEvent(event, addedItems)

    } catch (error) {
      console.log(error);
    }
  }
}