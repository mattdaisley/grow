import {
  ConnectedSocket,
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

  @SubscribeMessage('all-items')
  async handleGetAllItemsEvent(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket
  ): Promise<unknown> {

    // console.log('handleGetAllItemsEvent', data)
    const event = 'all-items';

    var getAllItems = new Promise((resolve, reject) => {
      const allItems = {};
      Object.keys(data).forEach(async (itemKey, index, array) => {
        const dynamicItems = await this.dynamicService.findManyByItemKey(itemKey)
        // console.log(dynamicItems)
        allItems[itemKey] = dynamicItems
        if (index === array.length -1) {
          resolve(allItems);
        }
      });
    });

    getAllItems.then((allItems) => {
      // console.log('returning', allItems)
      client.emit(event, allItems)
      return data;
    });

    return data;
    //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };
    // Object.keys(data).forEach(async itemKey => {
    //   const dynamicItems = await this.dynamicService.findManyByItemKey(itemKey)
    //   console.log(dynamicItems)
    //   allItems[itemKey] = { ...dynamicItems }
    //   // client.emit('all-items', dynamicItems)
    // })
  }
  
  @SubscribeMessage('set-item')
  async handleSetItemEvent(@MessageBody() data: unknown): Promise<WsResponse<unknown>> {
    const event = 'set-item';
    //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };
    
    var saveItems = new Promise((resolve, reject) => {
      const items = {};
      Object.keys(data).forEach(async (itemKey, i, a) => {

        items[itemKey] = [];
        const values = data[itemKey]
        Object.keys(values).forEach(async (valueKey, j, b) => {
          const createDynamicItemDto: CreateDynamicItemDto = { itemKey, valueKey, value: values[valueKey] }
          const dynamicItem = await this.dynamicService.create(createDynamicItemDto)
          items[itemKey].push(dynamicItem)
          if (i === a.length -1 && j === b.length -1) {
            resolve(items);
          }
        })
      })
    });

    saveItems.then((items) => {
      this.server.emit('item-set', items)
      // console.log('returning', items);
      return data;
    });
    return { event, data };
  }
}