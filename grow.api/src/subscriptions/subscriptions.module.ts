import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsGateway } from './subscriptions.gateway';
import { App } from './entities/app.entity';
import { AppCollection } from './entities/appCollection.entity';
import { AppRecord } from './entities/appRecord.entity';
import { AppRecordHistory } from './entities/appRecordHistory.entity';
import { Plugin } from './entities/plugin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([App, AppCollection, AppRecord, AppRecordHistory, Plugin]),
  ],
  exports: [SubscriptionsGateway],
  providers: [SubscriptionsGateway]
})
export class SubscriptionsModule {}
