import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult, Like, In } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { from, Observable } from 'rxjs';
import { last, map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { App } from './entities/app.entity';
import { AppCollection } from './entities/appCollection.entity';
import { AppRecord } from './entities/appRecord.entity';

let insertedIds = []
let insertedMessages = {}
let lastIndex = -1;

@WebSocketGateway({
  namespace: 'subscriptions',
  cors: {
    origin: '*',
  }
})

export class SubscriptionsGateway {
  @WebSocketServer()
  server: Server;

  apps = {}

  clientInstances = {}

  constructor(
    @InjectRepository(App)
    private appRepository: Repository<App>,

    @InjectRepository(AppCollection)
    private appCollectionRepository: Repository<AppCollection>,

    @InjectRepository(AppRecord)
    private appRecordRepository: Repository<AppRecord>,
  ) {
    // this.seedAppCollection().then(() => { console.log("seeded collections")});
  }

  private async seedAppCollection() {
    const data = JSON.parse(fs.readFileSync('./src/subscriptions/data.json', 'utf8'));

    this.appRepository.queryRunner?.startTransaction();

    try {

      for (const [appKey, appValue] of Object.entries(data.apps)) {

        const newApp = plainToClass(App, {
          id: Number(appKey),
          display_name: appValue['display_name'],
          contents: { plugins: appValue['plugins'] }
        });

        const existingApp = await this.appRepository.findOneBy({ id: Number(appKey)})

        if (!existingApp) {
          const savedApp = await this.appRepository.save(newApp)
          // console.log('seedApp saved', savedApp);
        }
        else {
          const updatedApp = this.appRepository.update(existingApp.id, newApp)
          // console.log('seedApp updated', updatedApp);
        }

        for (const [collectionKey, collectionValue] of Object.entries(appValue['collections'])) {

          const newAppCollection = plainToClass(AppCollection, {
            id: Number(collectionKey),
            appKey: Number(appKey), 
            contents: collectionValue['schema']
          });

          const existingAppCollection = await this.appCollectionRepository.findOneBy({ appKey: Number(appKey), id: Number(collectionKey)})

          if (!existingAppCollection) {
            const savedAppCollection = await this.appCollectionRepository.save(newAppCollection)
            // console.log('seedAppCollection saved', savedAppCollection);
          }
          else {
            const updatedAppCollection = this.appCollectionRepository.update(existingAppCollection.id, newAppCollection)
            // console.log('seedAppCollection updated', updatedAppCollection);
          }

          for (const [key, recordValue] of Object.entries(collectionValue['records'])) {
            // console.log('seed record', collectionKey, key)
            const newItem = plainToClass(AppRecord, {
              id: Number(key),
              appKey, 
              collectionKey: Number(collectionKey), 
              contents: recordValue
            });

            const existingItem = await this.appRecordRepository.findOneBy({ appKey: Number(appKey), collectionKey: Number(collectionKey), id: Number(key) })
            // console.log('seed record existingItem', existingItem, key, recordValue)
            if (!existingItem) {
              // console.log('seed record saving', newItem);
              const savedItem = await this.appRecordRepository.save(newItem)
              // console.log('seed record saved', savedItem);
            }
            else {
              const updatedItem = this.appRecordRepository.update(existingItem.id, newItem)
              // console.log('seed record updated', updatedItem);
            }
          }
        }
      }

      this.appRepository.queryRunner?.commitTransaction();
    }
    catch (error) {
      console.error('seedAppCollection error', error);
      this.appRepository.queryRunner?.rollbackTransaction();
    }
    finally {
      this.appRepository.queryRunner?.release();
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    client.emit('discover')
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    insertedIds = []
    insertedMessages = {}
    this.server?.emit('client-disconnect', { clientId: client.id })
  }


  @SubscribeMessage('get-app')
  async handleGetAppEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {
    console.log('handleGetAppEvent', body)

    const app = await this.appRepository.findOneBy({ id: body.appKey })

    if (!app) {
      return;
    }


    // console.log('handleGetAppEvent', body, app.contents)
    const event = `app-${body.appKey}`;

    const plugins = app.contents.plugins;

    const response = { key: body.appKey, plugins, collections: {} };

    // console.log('handleGetAppEvent returning', event)
    client.emit(event, response)
    return response;
  }

  @SubscribeMessage('get-app-list')
  async handleGetAppListEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {
    console.log('handleGetAppListEvent', body)

    const appsMap = {
      schema: {
        fields: {
          appKey: { type: 'string', name: 'appKey' },
          display_name: { type: 'string', name: 'display_name' },
        }
      },
      records: {}
    }

    const apps = await this.appRepository.find({ order: { id: 'ASC' }})

    apps.forEach(app => {
      appsMap.records[app.id] = {
        appKey: app.id,
        display_name: app.display_name
      };
    })

    // console.log('handleGetAppListEvent', body, appsMap)
    const event = `subscriptions-${body.appKey}`;

    const response = { al: appsMap }

    // console.log('handleGetAppListEvent returning', event)
    client.emit(event, response)
    return response;
  }

  @SubscribeMessage('get-plugin-list')
  async handleGetPluginListEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {
    console.log('handleGetPluginListEvent', body)

    const pluginsMap = {
      schema: {
        fields: {
          display_name: { type: 'string', name: 'display_name' },
          parent: { type: 'string', name: 'parent' },
        }
      },
      records: {}
    }

    const app = await this.appRepository
      .createQueryBuilder("app")
      .select("app.id")
      .addSelect("app.contents")
      .where("app.id = :appKey", { appKey: body.appKey })
      .orderBy("id", "ASC")
      .getOne();

    // console.log('handleGetPluginListEvent', body, app)
    Object.entries(app.contents.plugins).forEach(([key, value]) => {
      // console.log(value, app.contents.plugins[key]);
      pluginsMap.records[key] = {
        display_name: value.name,
        parent: value.parent
      };
    })

    // console.log('handleGetPluginListEvent', body, pluginsMap)
    const event = `subscriptions-${body.appKey}`;

    const response = { pl: pluginsMap }

    // console.log('handleGetCollectionListEvent returning', event)
    client.emit(event, response)
    return response;
  }

  @SubscribeMessage('get-collection-list')
  async handleGetCollectionListEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {
    console.log('handleGetCollectionListEvent', body)

    const collectionsMap = {
      schema: {
        fields: {
          collectionKey: { type: 'string', name: 'collectionKey' },
          display_name: { type: 'string', name: 'display_name' },
        }
      },
      records: {}
    }

    const collections = await this.appCollectionRepository
      .createQueryBuilder("app_collection")
      .select("app_collection.id", "collection_key")
      .addSelect("app_collection.contents->>'display_name'", "display_name")
      .where("app_collection.appKey = :appKey", { appKey: body.appKey })
      .orderBy("collection_key", "ASC")
      .getRawMany();

    collections.forEach(collection => {
      collectionsMap.records[collection.collection_key] = {
        collectionKey: collection.collection_key,
        display_name: `${collection.collection_key}: ${collection.display_name}`,
      };
    })

    // console.log('handleGetCollectionListEvent', body, collectionsMap)
    const event = `subscriptions-${body.appKey}`;

    const response = { cl: collectionsMap }

    // console.log('handleGetCollectionListEvent returning', event)
    client.emit(event, response)
    return response;
  }
  
  @SubscribeMessage('get-collection')
  async handleGetCollectionEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {

    // console.log('handleGetCollectionEvent', body)
    if (!body.appKey || body.collectionKey === '') {
      return;
    }

    const collectionEntity = await this.appCollectionRepository.findOneBy({ id: body.collectionKey, appKey: body.appKey })
    if (!collectionEntity) {
      return;
    }

    const event = `subscriptions-${body.appKey}`;

    const app = await this.appRepository.findOneBy({ id: body.appKey });

    const collectionRecords = {}
    const appRecordEntities = await this.appRecordRepository.findBy({ appKey: body.appKey, collectionKey: body.collectionKey })
    // console.log('collectionRecords', appRecordEntities)
    appRecordEntities.forEach(record => {
      // console.log('record', record.id, typeof record.contents)
      collectionRecords[record.id] = { 
        ...record.contents,
        createdDate: record.createdDate, 
        updatedDate: record.updatedDate
      };
    })

    const collection = {
      schema: collectionEntity.contents,
      records: collectionRecords,
    };

    // console.log('handleGetCollectionEvent', body, collectionEntity)

    const response = { l: { collectionKey: body.collectionKey, ...collection } }

    // console.log('handleGetCollectionEvent returning', event)
    client.emit(event, response)
    return response;
  }

  @SubscribeMessage('update-record')
  async handleUpdateRecordEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {

    const {
      appKey,
      appInstance,
      collectionKey,
      recordKey,
      fieldKey,
      newValue
    } = body;

    console.log('handleUpdateRecordEvent', body)
    const event = `subscriptions-${body.appKey}`;

    const existingItem = await this.appRecordRepository.findOneBy({ 
      appKey: Number(appKey), 
      collectionKey: Number(collectionKey), 
      id: Number(recordKey)
    })

    // console.log('seed record existingItem', existingItem, key, recordValue)
    let savedItem;

    if (!existingItem) {
      const newItem = plainToClass(AppRecord, {
        id: Number(recordKey),
        appKey, 
        collectionKey: Number(collectionKey), 
        contents: { [fieldKey]: newValue }
      });
      // console.log('seed record saving', newItem);
      savedItem = await this.appRecordRepository.save(newItem)
      // console.log('handleUpdateRecordEvent new record saved', savedItem);
    }
    else {
      existingItem.contents[fieldKey] = newValue;
      savedItem = await this.appRecordRepository.save(existingItem);
      // console.log('handleUpdateRecordEvent record updated', savedItem);
    }

    const response = { 
      appInstance,
      client: client.id, 
      u: { 
        collectionKey: body.collectionKey, 
        records: { 
          [body.recordKey]: { 
            [body.fieldKey]: body.newValue,
            updatedDate: savedItem.updatedDate
          } 
        } 
      } 
    }

    console.log('handleUpdateRecordEvent returning', event, response)
    this.server?.emit(event, response)
    return response;
  }

  @SubscribeMessage('create-record')
  async handleCreateRecordEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {
      const {
        appKey,
        appInstance,
        collectionKey,
        contents = {}
      } = body;
  
      // console.log('handleCreateRecordEvent', body)
      const event = `subscriptions-${body.appKey}`;
  
      const newItem = plainToClass(AppRecord, {
        appKey, 
        collectionKey: Number(collectionKey), 
        contents
      });
  
      const savedItem = await this.appRecordRepository.save(newItem)
      // console.log('handleCreateRecordEvent new record saved', savedItem); 

      const newRecord = {
        ...savedItem.contents,
        createdDate: savedItem.createdDate, 
        updatedDate: savedItem.updatedDate
      }
  
      const response = { 
        appInstance,
        // client: client.id, // drop so client can respone to it's own insert events. Not sure when a client would not need to.
        i: { 
          collectionKey: body.collectionKey, 
          records: { 
            [savedItem.id]: newRecord
          } 
        } 
      }

      // console.log('handleCreateRecordEvent returning', event, response)
      this.server?.emit(event, response)
      return response;
  }

  @SubscribeMessage('create-collection')
  async handleCreateCollection(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {
    const {
      appKey,
      name,
      displayName
    } = body;

    // console.log('handleCreateCollection', body)

    const event = `subscriptions-${appKey}`;

    const newItem = plainToClass(AppCollection, {
      appKey,
      contents: {
        name,
        display_name: displayName,
        fields: {}
      }
    });

    const savedAppCollection = await this.appCollectionRepository.save(newItem)

    const collection = { schema: savedAppCollection.contents, records: {} };
    // console.log('handleCreateCollection', savedCollection)
    // console.log('handleGetCollectionEvent', body, collectionEntity)

    const response = { l: { collectionKey: savedAppCollection.id, ...collection } }

    // console.log('handleCreateCollection returning', event, response)

    this.server?.emit(event, response)

    await this.handleGetCollectionListEvent({ appKey }, client)
  }

  @SubscribeMessage('create-collection-schema-field')
  async handleCreateCollectionSchemaField(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {
    const {
      appKey,
      appInstance,
      collectionKey,
      field
    } = body;

    // console.log('handleCreateCollectionSchemaField', body)

    const event = `subscriptions-${appKey}`;

    const collectionEntity = await this.appCollectionRepository.findOneBy({ id: body.collectionKey, appKey: body.appKey })

    const newFieldId = uuidv4();

    collectionEntity.contents['fields'][newFieldId] = field;

    const updatedCollection = await this.appCollectionRepository.update(collectionEntity.id, collectionEntity)

    // console.log('handleCreateCollectionSchemaField', updatedCollection)

    const response = { 
      appInstance,
      l: { 
        collectionKey: collectionKey, 
        schema: collectionEntity.contents
      } 
    }

    // console.log('handleCreateCollectionSchemaField returning', event, response)

    this.server?.emit(event, response)
  }

  

  @SubscribeMessage('mouse-moved')
  async handleMouseMoveEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {
    // console.log('handleMouseMoveEvent', body)
    const event = `mouse-moved-${body.appKey}`;

    const response = { ...body }

    // console.log('handleMouseMoveEvent returning', event, response)
    // console.log('handleMouseMoveEvent returning', event, body.x, body.y)
    this.server?.emit(event, response)
    return response;
  }
}