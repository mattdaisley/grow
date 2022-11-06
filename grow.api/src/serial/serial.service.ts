import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SerialService {
  
    constructor(
        @InjectQueue('serial') private readonly serialQueue: Queue
    ) { }

    public async write(message: string): Promise<void> {
        await this.serialQueue.add('send', {
            message
        });
    }
}
