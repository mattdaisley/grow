import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EventsGateway } from 'src/events/events.gateway';
import { CreateSensorReadingDto } from 'src/sensors/dto/create-sensor-reading.dto';
import { SensorsService } from 'src/sensors/sensors.service';

@Processor('serial')
export class SerialProcessor {

  constructor(
    private readonly eventsGateway: EventsGateway,
    private readonly sensorsService: SensorsService
  ){}

  @Process('receive')
  async handleReceivedMessage(job: Job) {
    try {
      const message = job.data.message
      this.eventsGateway.server.emit('events', `received: ${message}`);

      if (message.includes("H/S/")) {
        const parts = message.split("/");
        const sensorIndex = parts[2];
        const value = Number(parts[3]);

        const sensor = await this.sensorsService.findOneByIndex(sensorIndex);

        if (sensor && sensor.name == "TDS Sensor") {

          const temperature = 21.3;
          const compensationCoefficient = 1.0 + sensor.offset * (temperature - 25.0); //temperature compensation formula: fFinalResult(25^C) = fFinalResult(current)/(1.0+0.02*(fTP-25.0));
          const compensationVolatge = value / compensationCoefficient; //temperature compensation
          const tdsValue = (133.42 * compensationVolatge * compensationVolatge * compensationVolatge - 255.86 * compensationVolatge * compensationVolatge + 857.39 * compensationVolatge) * 0.5; //convert voltage value to tds value

          this.sensorsService.createReading(sensor.id, { value: tdsValue });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  @Process('sent')
  handleSendMessage(job: Job) {
    try {
      const message = job.data.message
      this.eventsGateway.server.emit('events', message);
    } catch (error) {
      console.log(error);
    }
  }
}