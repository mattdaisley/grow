import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { DynamicService } from '../dynamic/dynamic.service';
import { DynamicGateway } from '../dynamic/dynamic.gateway';
import { GpioService } from './gpio.service';
import { Scope } from '@nestjs/common';

@Processor({
  name: 'gpio',
  scope: Scope.REQUEST,
})
export class GpioProcessor {

  constructor(
    private readonly dynamicGateway: DynamicGateway,
    private readonly dynamicService: DynamicService,
    private readonly gpioService: GpioService,
  ){
  }

  @Process('discover-device')
  async handleDiscoverDeviceMessage(job: Job) {

    console.log('handleDiscoverDeviceMessage', job)

    const self = this;

    try {
      const message = job.data.message

      console.log('handleDiscoverDeviceMessage', message)

      const event = `items-gpio-device`;
      //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };
      if (Object.keys(message).length > 0) {
        const addedItems = await this.dynamicService.saveItems(message)

        console.log('handleDiscoverDeviceMessage emit', addedItems)
        self.dynamicGateway.emitEvent(event, addedItems)
      }

      // await self.gpioService.emitDiscover()
      console.log('job.data:', job.data);

    } catch (error) {
      console.log(error);
    }

    return {}
  }
}