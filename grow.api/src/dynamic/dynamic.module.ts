import { Module } from '@nestjs/common';
import { DynamicService } from './dynamic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicItem } from './entities/dynamic-item.entity';
import { DynamicGateway } from './dynamic.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([DynamicItem]),
  ],
  exports: [DynamicService, DynamicGateway],
  providers: [DynamicService, DynamicGateway]
})
export class DynamicModule {}
