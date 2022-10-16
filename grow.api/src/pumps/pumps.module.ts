import { Module } from '@nestjs/common';
import { PumpsService } from './pumps.service';
import { PumpsController } from './pumps.controller';

@Module({
  controllers: [PumpsController],
  providers: [PumpsService]
})
export class PumpsModule {}
