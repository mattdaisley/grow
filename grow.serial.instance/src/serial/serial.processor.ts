import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SerialService } from './serial.service';

@Processor('serial')
export class SerialProcessor {

  constructor(
    private serialService: SerialService
  ){}

  @Process('send')
  async handleSendMessage(job: Job) {
    try {
      const message = job.data.message
      console.log("serialProcessor handleSendMessage", message)
      await this.serialService.write(message);
    } catch (error) {
      console.log(error);
    }
  }
}