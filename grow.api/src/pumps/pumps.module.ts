import { Module } from '@nestjs/common';
import { PumpsService } from './pumps.service';
import { PumpsController } from './pumps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pump } from './entities/pump.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Pump]),
  ],
  controllers: [PumpsController],
  providers: [PumpsService]
})
export class PumpsModule {}
