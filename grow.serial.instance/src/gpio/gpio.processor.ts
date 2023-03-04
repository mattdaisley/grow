import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue } from 'bull';
import { Job } from 'bull';
import { GpioService } from './gpio.service';

@Processor('gpio')
export class GpioProcessor {

  constructor(
    @InjectQueue('gpio') private readonly gpioQueue: Queue,

    private gpioService: GpioService
  ){}

  @Process('discover')
  async handleSendMessage(job: Job) {
    const self = this;

    try {
      const message = job.data.message
      console.log("GpioProcessor handleSendMessage", message)

      const itemKey = 'gpio-device'
      const setItemsEvent = { [itemKey]: { [`${itemKey}.${self.gpioService.DeviceSerial}.device`]: self.gpioService.DeviceName } }

      if (message?.filter !== undefined) {
        if (self.gpioService.DeviceSerial.includes(message.filter)) {
          console.log("GpioProcessor setItemsEvent", setItemsEvent)
          await self.gpioQueue.add('discover-device', {
              message: setItemsEvent
          });
        }
      }
      else {
        console.log("GpioProcessor setItemsEvent", setItemsEvent)
        await self.gpioQueue.add('discover-device', {
            message: setItemsEvent
        });
      }

    } catch (error) {
      console.log(error);
    }
  }
}