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
import { DynamicAddItem, DynamicItemsAddRequest } from './dto/dynamic-items-add-request.dto';
import { DynamicItemsDeleteRequest } from './dto/dynamic-items-delete-request.dto';
import { DynamicItemsDeleteResponse } from './dto/dynamic-items-delete-response.dto';
import { DynamicItemsRequest } from './dto/dynamic-items-request.dto';
import { DynamicItemsResponse } from './dto/dynamic-items-response.dto';
import { DynamicItem } from './entities/dynamic-item.entity';

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
        // console.log(allItems, valueKey, index, array.length)
        if (allItems[itemKey].length === array.length) {
          resolve(allItems);
        }
      })
    })
    .then((items) => {
      this.server.emit(event, items)
      console.log('handleSetItemsEvent emit', event, items);
      return items;
    });
  }

  @SubscribeMessage('add-items')
  async handleAddItemsEvent(@MessageBody() data: DynamicItemsAddRequest): Promise<DynamicItemsResponse> {
    console.log('handleAddItemsEvent', data)

    const itemKey = data.itemKey;
    const event = `items-${itemKey}`;
    //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };
    
    return new Promise<DynamicItemsResponse>(async (resolve, reject) => {
      
      const addedItems = await this.addItems(itemKey, data.items)

      const allItems: DynamicItemsResponse = { 
        [itemKey]: addedItems 
      };

      resolve(allItems);
      
    })
    .then((items) => {
      this.server.emit(event, items)
      console.log('handleAddItemsEvent emit', event, items);
      return items;
    });
  }

  async addItems(itemKey: string, items: DynamicAddItem, prefix?: string) {
    console.log('addItems', itemKey, items, prefix)

    return new Promise<DynamicItem[]>(async (resolve, reject) => {
      
      let addedItems: DynamicItem[] = []
      let itemsToAdd: number = 0;

      const nextId = uuidv4()

      Object.keys(items).map(async valueKeyPrefix => {

        const itemToAdd = items[valueKeyPrefix]
        itemsToAdd += Object.keys(itemToAdd).length

        let itemPrefix = `${valueKeyPrefix}.${nextId}`;
        if (prefix !== undefined) {
          itemPrefix = `${prefix}.${itemPrefix}`
        }
        
        console.log('itemToAdd', valueKeyPrefix, itemPrefix, itemToAdd)

        Object.keys(itemToAdd).map(async valueKeySuffix => {

          const valueKey = `${itemPrefix}.${valueKeySuffix}`;
          const value = itemToAdd[valueKeySuffix];

          if (typeof value === "string") {

            const createDynamicItemDto: CreateDynamicItemDto = { itemKey, valueKey, value }

            console.log('handleAddItemsEvent creating item', createDynamicItemDto)
            const dynamicItem = await this.dynamicService.create(createDynamicItemDto)

            addedItems.push(dynamicItem)
          }
          else {
            const nestedItems = await this.addItems(itemKey, { [valueKeySuffix]: value }, itemPrefix);
            itemsToAdd += nestedItems.length - 1 // subtract one because we already counted the valueSuffix as one

            addedItems = [
              ...addedItems,
              ...nestedItems
            ]
          }

          console.log('should resolve?', addedItems.length === itemsToAdd, addedItems.length, itemsToAdd)
          if (addedItems.length === itemsToAdd) {
            resolve(addedItems);
          }
        })

      })
      
    })
  }
  
  @SubscribeMessage('delete-items')
  async handleDeleteItemsEvent(@MessageBody() data: DynamicItemsDeleteRequest): Promise<DynamicItemsDeleteResponse> {
    console.log('handleDeleteItemsEvent', data)

    const itemKey = data.itemKey;
    const items = data.items;
    const event = `items-${itemKey}`;

    const allItems: DynamicItemsDeleteResponse = { [itemKey]: [] };
    
    return new Promise<DynamicItemsDeleteResponse>(async (resolve, reject) => {

      Object.keys(items).forEach(async (valueKey, index, array) => {

        console.log('handleDeleteItemsEvent deleting item', valueKey)
        await this.dynamicService.delete(itemKey, valueKey)

        allItems[itemKey].push({ valueKey, deleted: true })
        if (allItems[itemKey].length === array.length) {
          resolve(allItems);
        }
      })
    })
    .then((items) => {
      this.server.emit(event, items)
      console.log('handleDeleteItemsEvent emit', event, items);
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