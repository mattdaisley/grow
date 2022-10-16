import { Module } from '@nestjs/common';
import { PumpsService } from './pumps.service';
import { PumpsController } from './pumps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pump } from './entities/pump.entity'
import { SerialService } from 'src/serial/serial.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pump]),
  ],
  controllers: [PumpsController],
  providers: [PumpsService, SerialService]
})
export class PumpsModule {}
