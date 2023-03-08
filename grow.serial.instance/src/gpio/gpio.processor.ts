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
  async handleDiscoverJob(job: Job) {
    const self = this;

    try {
      const message = job.data.message
      console.log("GpioProcessor handleDiscoverJob", message)

      if (message?.filter !== undefined) {
        if (self.gpioService.DeviceSerial.includes(message.filter)) {
          self.gpioService.emitDiscoverDevice()
        }
      }
      else {
        self.gpioService.emitDiscoverDevice()
      }

    } catch (error) {
      console.log(error);
    }
  }
}