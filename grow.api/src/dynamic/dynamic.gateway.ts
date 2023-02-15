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
import { v4 as uuidv4 } from 'uuid';

import { DynamicService } from './dynamic.service';
import { CreateDynamicItemDto } from './dto/create-dynamic-item.dto';
import { DynamicItemsRequest } from './dto/dynamic-items-request.dto';
import { DynamicItemsResponse } from './dto/dynamic-items-response.dto';
import { DynamicItemsAddRequest } from './dto/dynamic-items-add-request.dto';

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


  @SubscribeMessage('get-items')
  async handleGetItemsEvent(
    @MessageBody() data: DynamicItemsRequest,
    @ConnectedSocket() client: Socket
  ): Promise<DynamicItemsResponse> {

    console.log('handleGetItemsEvent', data)
    const event = `items-${data.itemKey}`;

    const allItems: DynamicItemsResponse = { [data.itemKey]: [] };

    const dynamicItems = await this.dynamicService.findManyByItemKey(data.itemKey)
    allItems[data.itemKey] = dynamicItems
    // console.log(dynamicItems)

    console.log('handleGetItemsEvent returning', event, allItems[data.itemKey].length)
    client.emit(event, allItems)
    return allItems;
  }

  @SubscribeMessage('set-items')
  async handleSetItemsEvent(@MessageBody() data: DynamicItemsRequest): Promise<DynamicItemsResponse> {
    console.log('handleSetItemsEvent', data)

    const itemKey = data.itemKey;
    const values = data.values;
    const event = `items-${itemKey}`;
    //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };

    const allItems: DynamicItemsResponse = { [itemKey]: [] };
    
    return new Promise<DynamicItemsResponse>((resolve, reject) => {

      Object.keys(values).forEach(async (valueKey, index, array) => {
        const createDynamicItemDto: CreateDynamicItemDto = { itemKey, valueKey, value: values[valueKey] }

        console.log('handleSetItemsEvent creating item', createDynamicItemDto)
        const dynamicItem = await this.dynamicService.create(createDynamicItemDto)

        allItems[itemKey].push(dynamicItem)
        
        if (index === array.length -1) {
          resolve(allItems);
        }
      })
    })
    .then((items) => {
      this.server.emit(event, allItems)
      // console.log('returning', items);
      return items;
    });
  }

  @SubscribeMessage('add-item')
  async handleAddItemEvent(@MessageBody() data: DynamicItemsAddRequest): Promise<DynamicItemsResponse> {
    console.log('handleSetItemsEvent', data)

    const itemKey = data.itemKey;
    const valueKeyPrefix = data.valueKeyPrefix;
    const valueKeySuffix = data.valueKeySuffix;
    const value = data.value;
    const event = `items-${itemKey}`;
    //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };

    const allItems: DynamicItemsResponse = { [itemKey]: [] };
    
    return new Promise<DynamicItemsResponse>(async (resolve, reject) => {
      const valueKey = `${valueKeyPrefix}.${uuidv4()}.${valueKeySuffix}`;

      const createDynamicItemDto: CreateDynamicItemDto = { itemKey, valueKey, value }

      console.log('handleAddItemEvent creating item', createDynamicItemDto)
      const dynamicItem = await this.dynamicService.create(createDynamicItemDto)

      allItems[itemKey].push(dynamicItem)
      
      resolve(allItems);
    })
    .then((items) => {
      this.server.emit(event, allItems)
      // console.log('returning', items);
      return items;
    });
  }



  @SubscribeMessage('all-items')
  async handleGetAllItemsEvent(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket
  ): Promise<unknown> {

    console.log('handleGetAllItemsEvent', data)
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
    console.log('handleSetItemEvent', data)
    const event = 'set-item';
    //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };
    
    var saveItems = new Promise((resolve, reject) => {
      const items = {};
      Object.keys(data).forEach(async (itemKey, i, a) => {

        items[itemKey] = [];
        const values = data[itemKey]
        Object.keys(values).forEach(async (valueKey, j, b) => {
          const createDynamicItemDto: CreateDynamicItemDto = { itemKey, valueKey, value: values[valueKey] }
          console.log('creating item', createDynamicItemDto)
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
  
  @SubscribeMessage('delete-item')
  async handleDeleteItemEvent(@MessageBody() data: unknown): Promise<WsResponse<unknown>> {
    const event = 'delete-item';
    //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };
    
    var deleteItems = new Promise((resolve, reject) => {
      const items = {};
      Object.keys(data).forEach(async (itemKey, i, a) => {

        items[itemKey] = [];
        const values = data[itemKey]
        Object.keys(values).forEach(async (valueKey, j, b) => {
          // const createDynamicItemDto: CreateDynamicItemDto = { itemKey, valueKey, value: values[valueKey] }
          // const dynamicItem = await this.dynamicService.create(createDynamicItemDto)
          await this.dynamicService.delete(itemKey, valueKey)
          items[itemKey].push({ valueKey })
          if (i === a.length -1 && j === b.length -1) {
            resolve(items);
          }
        })
      })
    });

    deleteItems.then((items) => {
      this.server.emit('item-deleted', items)
      // console.log('returning', items);
      return data;
    });
    return { event, data };
  }
}