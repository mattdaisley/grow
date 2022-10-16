import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PumpsModule } from './pumps/pumps.module';

@Module({
  imports: [PumpsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
