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


  constructor(
    @InjectRepository(App)
    private appRepository: Repository<App>,

    @InjectRepository(AppCollection)
    private appCollectionRepository: Repository<AppCollection>,

    @InjectRepository(AppRecord)
    private appRecordRepository: Repository<AppRecord>,
  ) {
    this.seedAppCollection().then(() => { console.log("seeded collections")});

    const timer = setInterval(() => {

      let typeIndex = Math.floor(Math.random() * 3);
      if (insertedIds.length === 0) {
        typeIndex = 0;
      }
      // let typeIndex = (lastIndex + 1) % 3;
      lastIndex = typeIndex;

      const wordsList = [
        'apple', 'banana', 'cherry', 'date', 'elderberry',
        'fig', 'grape', 'honeydew', 'iceberg', 'jackfruit',
        'kiwi', 'lemon', 'mango', 'nectarine', 'orange',
        'pineapple', 'quince', 'raspberry', 'strawberry', 'tomato',
        'ugli', 'victoria', 'watermelon', 'xigua', 'yellow',
        'zucchini'
      ];

      const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];

      const record = {
        "f_1_0_0": "plugin-page-v1",
        "f_1_0_1": randomWord.charAt(0).toUpperCase() + randomWord.slice(1),
        "f_1_0_2": `/${randomWord}`,
        "f_1_0_3": "8",
        "f_1_0_4": "1"
      }

      let message;
      if (typeIndex === 0) {
        const id = `${uuidv4()}`;
        message = {
          i: {
            'collectionKey': '7',
            'records': {
              [id]: record
            }
          }
        }
        insertedIds.push(id)
        insertedMessages[id] = message;

        if (this.apps['2']?.collections['7']?.records) {
          this.apps['2'].collections['7'].records[id] = record;
        }
      }
      if (typeIndex === 1 && insertedIds.length > 0) {
        const idToUpdate = insertedIds[Math.floor(Math.random() * insertedIds.length)];
        message = { u: {
            'collectionKey': '7',
            'records': {
              [idToUpdate]: {
                "f_1_0_1": randomWord.charAt(0).toUpperCase() + randomWord.slice(1),
                "f_1_0_2": `/${randomWord}`,
              }
            }
          }
        }
      }
      if (typeIndex === 2 && insertedIds.length > 0) {
        const idToDelete = insertedIds[Math.floor(Math.random() * insertedIds.length)];
        message = { d: {
            'collectionKey': '7',
            'records': {
              [idToDelete]: {}
            }
          }
        }
        insertedIds.splice(insertedIds.indexOf(idToDelete), 1)

        this.apps['2']?.collections['7']?.records?.delete && this.apps['2']?.collections['7']?.records?.delete(idToDelete);
      }

      // console.log('subscriptions-1', typeIndex, randomWord)
      if (message) {
        this.server?.emit('subscriptions-2', message );
      }
    }, 10000);
  }

  private async seedAppCollection() {
    const data = JSON.parse(fs.readFileSync('./src/subscriptions/data.json', 'utf8'));

    this.appRepository.queryRunner?.startTransaction();

    try {

      for (const [appKey, appValue] of Object.entries(data.apps)) {

        const newApp = plainToClass(App, {
          id: Number(appKey),
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
              appKey, collectionKey: Number(collectionKey), contents: recordValue
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

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    insertedIds = []
    insertedMessages = {}
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    client.emit('discover')
  }


  @SubscribeMessage('get-app')
  async handleGetAppEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {

    const app = await this.appRepository.findOneBy({ id: body.appKey })

    if (!app) {
      return;
    }

    this.apps[body.appKey] = app.contents;

    // console.log('handleGetAppEvent', body, app.contents)
    const event = `app-${body.appKey}`;

    const plugins = this.apps[body.appKey].plugins;

    const response = { key: body.appKey, plugins, collections: {} };

    // console.log('handleGetAppEvent returning', event)
    client.emit(event, response)
    return response;
  }

  @SubscribeMessage('get-collection-list')
  async handleGetCollectionListEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {
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
        display_name: collection.display_name
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
    const collectionEntity = await this.appCollectionRepository.findOneBy({ id: body.collectionKey, appKey: body.appKey })

    if (!this.apps.hasOwnProperty(body.appKey)) { 
      const app = await this.appRepository.findOneBy({ id: body.appKey })
      this.apps[body.appKey] = app.contents;  
    }

    if (!this.apps[body.appKey].collections) {
      this.apps[body.appKey].collections = {};
    }

    const collectionRecords = {}
    const appRecordEntities = await this.appRecordRepository.findBy({ appKey: body.appKey, collectionKey: body.collectionKey })
    // console.log('collectionRecords', collectionRecords)
    appRecordEntities.forEach(record => {
      collectionRecords[record.id] = record.contents;
    })

    this.apps[body.appKey].collections[body.collectionKey] = { schema: collectionEntity.contents, records: collectionRecords };

    // console.log('handleGetCollectionEvent', body, collectionEntity)
    const event = `subscriptions-${body.appKey}`;

    const collection = this.apps[body.appKey].collections[body.collectionKey];

    const response = { l: { collectionKey: body.collectionKey, ...collection } }

    // console.log('handleGetCollectionEvent returning', event)
    setTimeout(() => {
      client.emit(event, response)
    }, 100) // simulating data fetch delay
    return response;
  }

  @SubscribeMessage('update-record')
  async handleUpdateRecordEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {

    if (!this.apps.hasOwnProperty(body.appKey)) { 
      const data = JSON.parse(fs.readFileSync('./src/subscriptions/data.json', 'utf8'));
      this.apps[body.appKey] = data.apps[body.appKey];
    }


    console.log('handleUpdateRecordEvent', body)
    const event = `subscriptions-${body.appKey}`;

    this.apps[body.appKey].collections[body.collectionKey].records[body.recordKey][body.fieldKey] = body.newValue;

    const response = { client: client.id, u: { collectionKey: body.collectionKey, records: { [body.recordKey]: { [body.fieldKey]: body.newValue } } } }

    // console.log('handleUpdateRecordEvent returning', event)
    setTimeout(() => {
      this.server?.emit(event, response)
    }, 100) // simulating data fetch delay
    return response;
  }
}