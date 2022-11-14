import { forwardRef, Module } from '@nestjs/common';
import { OutletsService } from './outlets.service';
import { OutletsController } from './outlets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outlet } from './entities/outlet.entity'
import { SerialModule } from 'src/serial/serial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Outlet]),
    forwardRef(() => SerialModule),
  ],
  exports: [OutletsService],
  controllers: [OutletsController],
  providers: [OutletsService]
})
export class OutletsModule {}
