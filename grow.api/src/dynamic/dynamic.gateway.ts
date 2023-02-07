import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { DynamicService } from './dynamic.service';
import { CreateDynamicItemDto } from './dto/create-dynamic-item.dto';

@WebSocketGateway({
  namespace: 'dynamic',
  cors: {
    origin: '*',
  }
})
export class DynamicGateway {
  @WebSocketServer()
  server: Server;


  constructor(

    private readonly dynamicService: DynamicService
  ) { }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(map(item => ({ event: 'reading', data: item })));
  }
  
  @SubscribeMessage('set-item')
  async handleEvent(@MessageBody() data: unknown): Promise<WsResponse<unknown>> {
    const event = 'set-item';
    //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };
    Object.keys(data).forEach(async itemKey => {
      const values = data[itemKey]
      Object.keys(values).forEach(async valueKey => {
        const createDynamicItemDto: CreateDynamicItemDto = { ItemKey: itemKey, ValueKey: valueKey, Value: values[valueKey]}
        const dynamicItem = await this.dynamicService.create(createDynamicItemDto)
        this.server.emit('item-set', dynamicItem)
      })
    })
    return { event, data };
  }
}