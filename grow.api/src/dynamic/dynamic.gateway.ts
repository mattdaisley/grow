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
  ) {}

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    client.emit('discover')
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

    const self = this;

    const itemKey = data.itemKey;
    const values = data.values;
    const event = `items-${itemKey}`;
    //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };
    
    return new Promise<DynamicItemsResponse>((resolve, reject) => {

      const allItems: DynamicItemsResponse = { [itemKey]: [] };

      Object.keys(values).forEach(async (valueKey, index, array) => {
        const createDynamicItemDto: CreateDynamicItemDto = { itemKey, valueKey, value: values[valueKey] }

        // console.log('handleSetItemsEvent creating item', createDynamicItemDto)
        const dynamicItem = await this.dynamicService.create(createDynamicItemDto)

        allItems[itemKey].push(dynamicItem)
        // console.log(allItems, valueKey, index, array.length)
        if (allItems[itemKey].length === array.length) {
          resolve(allItems);
        }
      })
    })
    .then(self.processAutomation.bind(self))
    .then((allItems) => {
      this.server.emit(event, allItems)
      // console.log('handleSetItemsEvent emit', event, allItems);
      return allItems;
    });
  }

  @SubscribeMessage('add-items')
  async handleAddItemsEvent(@MessageBody() data: DynamicItemsAddRequest): Promise<DynamicItemsResponse> {
    console.log('handleAddItemsEvent', data)

    const self = this;

    const itemKey = data.itemKey;
    const event = `items-${itemKey}`;
    //const createSensorReadingDto: CreateSensorReadingDto = { value: tdsValue };
    
    return new Promise<DynamicItemsResponse>(async (resolve, reject) => {
      
      const addedItems = await this.dynamicService.addItems(itemKey, data.items)

      const allItems: DynamicItemsResponse = { 
        [itemKey]: addedItems 
      };

      resolve(allItems);
      
    })
    .then(self.processAutomation.bind(self))
    .then((allItems) => {
      this.server.emit(event, allItems)
      // console.log('handleAddItemsEvent emit', event, allItems);
      return allItems;
    });
  }

  async processAutomation(allItems: DynamicItemsResponse) {
    const self = this; 

    return new Promise<DynamicItemsResponse>((resolve, reject) => {

      // if (data.automation === false) {
      //   resolve(allItems)
      //   return;
      // }

      const automationConditions = {
        ['preview_collections_570c9f24-3409-413b-ab8d-6aaa610ca58f']: { // Outlets
          ['gpio-config']: ['device_field', 'output_pin', 'on_state', 'startup_state', 'shutdown_state', 'automation_type', 'time_on', 'time_off']
        },
        ['preview_collections_ba0180b3-7b26-4b4d-adea-1198408578bf']: { // Nutrient Pumps
          ['gpio-config']: ['device_field', 'output_pin', 'on_state', 'startup_state', 'shutdown_state', 'automation_type', 'time_on', 'time_off']
        },
        ['preview_collections_2f88f0f2-b775-468c-aaf6-8bd12396125a']: { // Outlet Events, outlet_events
          ['gpio-command']: ['select_outlet']
        },
        ['preview_collections_54e2aa1e-c548-4906-8be9-f2b86b7443ed']: { // Nutrient Pump Events, nutrient_pump_events
          ['gpio-command']: ['selected_nutrient_pump']
        }
      }

      Object.keys(allItems).forEach(async (itemKey, index, array) => {

        const items = allItems[itemKey]

        Object.keys(automationConditions).forEach(automationConditionItemKey => {
          const automationCondition = automationConditions[automationConditionItemKey]

          // console.log('checking automation', itemKey, '===', automationConditionItemKey, itemKey === automationConditionItemKey)
          if (itemKey === automationConditionItemKey) {

            Object.keys(automationCondition).forEach(eventKey => {

              const conditionNames = automationCondition[eventKey]
              console.log('checking automation', conditionNames, 'includes', items.map(item => item.valueKey.split('.').at(-1)))

              // automation needs a specific field
              if (items.filter(item => conditionNames.includes(item.valueKey.split('.').at(-1))).length > 0) {
                const uniqueValueKeys = []
                const mappedPromises = [];
                items.forEach(item => {
                  console.log(eventKey, item)
                  if (eventKey === 'gpio-config') {
                    const itemValueKey = item.valueKey.split('.').slice(0, -1).join('.')
                    if (!uniqueValueKeys.includes(itemValueKey)) {
                      uniqueValueKeys.push(itemValueKey)
                    }
                  }
                  else {
                    if (!uniqueValueKeys.includes(item.value)) {
                      uniqueValueKeys.push(item.value)
                    }
                  }
                })
                uniqueValueKeys.forEach(uniqueValueKey => {
                  mappedPromises.push(self.getReferencedCollectionObject(uniqueValueKey))
                })
                Promise.all(mappedPromises)
                  .then(values => {
                    console.log(values)

                    const data = []
                    items.forEach((item, index) => {
                      data.push({ item, value: values[index]})
                    });

                    const message = { [automationConditionItemKey]: {data} }
                    this.server.emit(eventKey, message)
                    console.log('processAutomation emit', eventKey, message);
                  })
              }
            })
          }
        })

      })
      resolve(allItems)
    })
  }

  async getReferencedCollectionObject(valueKey: string) {
    const referencedCollectionObject = {}
    const referencedCollectionFields = await this.dynamicService.findManyByValueKey(valueKey)
    
    let expectedFieldsCount = referencedCollectionFields.length;

    return new Promise((resolve) => {
      referencedCollectionFields.forEach(async (referencedCollectionField, index, array) => {
        const key = referencedCollectionField.valueKey.replace(`${valueKey}.`, "")
        if (key === 'type') {
          expectedFieldsCount = expectedFieldsCount - 1; // Ignore the type for these objects
        }
        else if (referencedCollectionField.value.includes('.')) {
          referencedCollectionObject[key] = await this.getReferencedCollectionObject(referencedCollectionField.value)
        }
        else {
          referencedCollectionObject[key] = referencedCollectionField.value
        }

        if (Object.keys(referencedCollectionObject).length === expectedFieldsCount) {
          resolve(referencedCollectionObject)
        }
      })
    })
  }

  @SubscribeMessage('delete-items')
  async handleDeleteItemsEvent(@MessageBody() data: DynamicItemsDeleteRequest): Promise<DynamicItemsDeleteResponse> {
    // console.log('handleDeleteItemsEvent', data)

    const itemKey = data.itemKey;
    const items = data.items;
    const event = `items-${itemKey}`;

    const allItems: DynamicItemsDeleteResponse = { [itemKey]: [] };
    
    return new Promise<DynamicItemsDeleteResponse>(async (resolve, reject) => {

      Object.keys(items).forEach(async (valueKey, index, array) => {

        // console.log('handleDeleteItemsEvent deleting item', valueKey)
        await this.dynamicService.delete(itemKey, valueKey)

        allItems[itemKey].push({ valueKey, deleted: true })
        if (allItems[itemKey].length === array.length) {
          resolve(allItems);
        }
      })
    })
    .then((items) => {
      this.server.emit(event, items)
      // console.log('handleDeleteItemsEvent emit', event, items);
      return items;
    });
  }

  @SubscribeMessage('gpio-device')
  async handleDiscoverDeviceEvent(@MessageBody() data: unknown): Promise<unknown> {

    // console.log('handleDiscoverDeviceMessage', data)

    try {
      const event = `items-gpio-device`;

      if (Object.keys(data).length > 0) {
        const addedItems = await this.dynamicService.saveItems(data)

        // console.log('handleDiscoverDeviceMessage emit', addedItems)
        this.server.emit(event, addedItems)
      }

    } catch (error) {
      console.log(error);
    }

    return;
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

    const self = this;
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
      self.emitEvent('set-item', items)
      // console.log('returning', items);
      return data;
    });
    return { event, data };
  }

  public emitEvent(event: string, items: unknown) {
    this.server.emit(event, items)
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