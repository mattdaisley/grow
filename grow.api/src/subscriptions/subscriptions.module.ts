import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsGateway } from './subscriptions.gateway';
import { App } from './entities/app.entity';
import { AppCollection } from './entities/appCollection.entity';
import { AppRecord } from './entities/appRecord.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([App, AppCollection, AppRecord]),
  ],
  exports: [SubscriptionsGateway],
  providers: [SubscriptionsGateway]
})
export class SubscriptionsModule {}
