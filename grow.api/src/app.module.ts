import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PumpsModule } from './pumps/pumps.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SerialModule } from './serial/serial.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'growapi',
      password: 'pimylifeup',
      database: 'grow',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    PumpsModule,
    SerialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
