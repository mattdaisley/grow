import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class GpioService {
  
    constructor(
        @InjectQueue('gpio') private readonly gpioQueue: Queue
    ) { }

    public async emitDiscover () {
        console.log('GpioService add discover job')
        await this.gpioQueue.add('discover');
    }
    
}
