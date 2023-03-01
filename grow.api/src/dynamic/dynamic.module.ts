import { Module } from '@nestjs/common';
import { DynamicService } from './dynamic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicItem } from './entities/dynamic-item.entity';
import { DynamicGateway } from './dynamic.gateway';
import { DynamicController } from './dynamic.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DynamicItem]),
  ],
  controllers: [DynamicController],
  exports: [DynamicService, DynamicGateway],
  providers: [DynamicService, DynamicGateway]
})
export class DynamicModule {}
