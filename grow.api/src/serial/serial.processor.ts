import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('serial')
export class SerialProcessor {

  @Process('receive')
  handleReceivedMessage(job: Job) {
    console.log('Start processing received message...');
    console.log(job.data);
    console.log('Completed processing received message');
  }
}