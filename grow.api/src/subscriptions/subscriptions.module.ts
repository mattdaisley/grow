import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsGateway } from './subscriptions.gateway';
import { Item } from './entities/item.entity';
import { AppCollection } from './entities/appCollection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppCollection, Item]),
  ],
  exports: [SubscriptionsGateway],
  providers: [SubscriptionsGateway]
})
export class SubscriptionsModule {}
