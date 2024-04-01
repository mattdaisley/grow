import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsGateway } from './subscriptions.gateway';

@Module({
  imports: [
    // TypeOrmModule.forFeature([DynamicItem]),
  ],
  exports: [SubscriptionsGateway],
  providers: [SubscriptionsGateway]
})
export class SubscriptionsModule {}
