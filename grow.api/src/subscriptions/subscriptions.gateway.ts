import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { App } from './entities/app.entity';
import { AppCollection } from './entities/appCollection.entity';
import { AppRecord } from './entities/appRecord.entity';
import { Plugin } from './entities/plugin.entity';

@WebSocketGateway({
  namespace: 'subscriptions',
  cors: {
    origin: '*',
  },
})
export class SubscriptionsGateway {
  @WebSocketServer()
  server: Server;

  apps = {};

  clientInstances = {};

  constructor(
    @InjectRepository(Plugin)
    private pluginRepository: Repository<Plugin>,

    @InjectRepository(App)
    private appRepository: Repository<App>,

    @InjectRepository(AppCollection)
    private appCollectionRepository: Repository<AppCollection>,

    @InjectRepository(AppRecord)
    private appRecordRepository: Repository<AppRecord>,
  ) {
    // this.seedAppCollection().then(() => { console.log("seeded collections")});
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    client.emit('discover');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.server?.emit('client-disconnect', { clientId: client.id });
  }

  @SubscribeMessage('get-app')
  async handleGetAppEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    console.log('handleGetAppEvent', body);

    const app = await this.appRepository.findOneBy({ id: body.appKey });

    if (!app) {
      return;
    }

    // console.log('handleGetAppEvent', body, app.contents)
    const event = `app-${body.appKey}`;

    const plugins = app.contents.plugins;

    const globalPlugins = await this.pluginRepository.find({
      order: { key: 'ASC' },
    });

    const pluginsMap = {};

    // console.log('handleGetPluginListEvent', body, app)
    Object.entries(globalPlugins).forEach(([id, plugin]) => {
      // console.log(value, app.contents.plugins[key]);
      pluginsMap[plugin.key] = {
        ...plugin.contents,
      };
    });

    Object.entries(plugins).forEach(([id, plugin]) => {
      // console.log('handleGetAppEvent', id, plugin)
      pluginsMap[id] = {
        ...pluginsMap[id],
        ...plugin,
      };
    });
    // console.log('handleGetAppEvent', plugins, pluginsMap)

    const response = { key: body.appKey, plugins: pluginsMap, collections: {} };

    console.log('handleGetAppEvent returning', event, response);
    client.emit(event, response);
    return response;
  }

  @SubscribeMessage('get-app-list')
  async handleGetAppListEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    console.log('handleGetAppListEvent', body);

    const appsMap = {
      schema: {
        fields: {
          appKey: { type: 'string', name: 'appKey' },
          display_name: { type: 'string', name: 'display_name' },
        },
      },
      records: {},
    };

    const apps = await this.appRepository.find({ order: { id: 'ASC' } });

    apps.forEach((app) => {
      appsMap.records[app.id] = {
        appKey: app.id,
        display_name: app.display_name,
      };
    });

    // console.log('handleGetAppListEvent', body, appsMap)
    const event = `subscriptions-${body.appKey}`;

    const response = { al: appsMap };

    // console.log('handleGetAppListEvent returning', event)
    client.emit(event, response);
    return response;
  }

  @SubscribeMessage('get-plugin-list')
  async handleGetPluginListEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    console.log('handleGetPluginListEvent', body);

    const pluginsMap = {
      schema: {
        fields: {
          display_name: { type: 'string', name: 'display_name' },
          parent: { type: 'string', name: 'parent' },
        },
      },
      records: {},
    };

    const plugins = await this.pluginRepository.find({ order: { key: 'ASC' } });

    // console.log('handleGetPluginListEvent', body, app)
    Object.entries(plugins).forEach(([id, plugin]) => {
      // console.log(value, app.contents.plugins[key]);
      pluginsMap.records[plugin.key] = {
        display_name: plugin.contents.name,
        parent: plugin.contents.parent,
      };
    });

    // console.log('handleGetPluginListEvent', body, pluginsMap)
    const event = `subscriptions-${body.appKey}`;

    const response = { pl: pluginsMap };

    // console.log('handleGetCollectionListEvent returning', event)
    client.emit(event, response);
    return response;
  }

  @SubscribeMessage('get-collection-list')
  async handleGetCollectionListEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    console.log('handleGetCollectionListEvent', body);

    const collectionsMap = {
      schema: {
        fields: {
          collectionKey: { type: 'string', name: 'collectionKey' },
          display_name: { type: 'string', name: 'display_name' },
          name: { type: 'string', name: 'name' },
        },
      },
      records: {},
    };

    const collections = await this.appCollectionRepository
      .createQueryBuilder('app_collection')
      .select('app_collection.id', 'collection_key')
      .addSelect("app_collection.contents->>'display_name'", 'display_name')
      .addSelect("app_collection.contents->>'name'", 'name')
      .where('app_collection.appKey = :appKey', { appKey: body.appKey })
      .orderBy('collection_key', 'ASC')
      .getRawMany();

    collections.forEach((collection) => {
      collectionsMap.records[collection.collection_key] = {
        collectionKey: collection.collection_key,
        // display_name: `${collection.display_name} (${collection.collection_key})`,
        display_name: collection.display_name,
        name: collection.name,
      };
    });

    // console.log('handleGetCollectionListEvent', body, collectionsMap)
    const event = `subscriptions-${body.appKey}`;

    const response = { cl: collectionsMap };

    // console.log('handleGetCollectionListEvent returning', event)
    client.emit(event, response);
    return response;
  }

  @SubscribeMessage('get-collection')
  async handleGetCollectionEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    // console.log('handleGetCollectionEvent', body)
    if (
      !body.appKey ||
      !body.collectionKey ||
      body.collectionKey === '' ||
      body.collectionKey === 'null'
    ) {
      return;
    }

    const collectionEntity = await this.appCollectionRepository.findOneBy({
      id: body.collectionKey,
      appKey: body.appKey,
    });
    if (!collectionEntity) {
      return;
    }

    const event = `subscriptions-${body.appKey}`;

    const app = await this.appRepository.findOneBy({ id: body.appKey });

    const collectionRecords = {};
    const appRecordEntities = await this.appRecordRepository.findBy({
      appKey: body.appKey,
      collectionKey: body.collectionKey,
    });
    // console.log('collectionRecords', appRecordEntities)
    appRecordEntities.forEach((record) => {
      // console.log('record', record.id, typeof record.contents)
      collectionRecords[record.id] = {
        ...record.contents,
        createdDate: record.createdDate,
        updatedDate: record.updatedDate,
        version: record.version,
      };
    });

    const collection = {
      schema: collectionEntity.contents,
      records: collectionRecords,
    };

    // console.log('handleGetCollectionEvent', body, collectionEntity)

    const response = {
      l: { collectionKey: body.collectionKey, ...collection },
    };

    // console.log('handleGetCollectionEvent returning', event)
    client.emit(event, response);
    return response;
  }

  @SubscribeMessage('update-record')
  async handleUpdateRecordEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const {
      appKey,
      appInstance,
      collectionKey,
      recordKey,
      fieldKey,
      newValue,
    } = body;

    // console.log('handleUpdateRecordEvent', body)
    const event = `subscriptions-${body.appKey}`;

    const existingItem = await this.appRecordRepository.findOneBy({
      appKey: Number(appKey),
      collectionKey: Number(collectionKey),
      id: Number(recordKey),
    });

    // console.log('seed record existingItem', existingItem, key, recordValue)
    let savedItem;

    if (!existingItem) {
      const newItem = plainToClass(AppRecord, {
        id: Number(recordKey),
        appKey,
        collectionKey: Number(collectionKey),
        contents: { [fieldKey]: newValue },
      });
      // console.log('seed record saving', newItem);
      savedItem = await this.appRecordRepository.save(newItem);
      // console.log('handleUpdateRecordEvent new record saved', savedItem);
    } else {
      existingItem.contents[fieldKey] = newValue;
      existingItem.version += 1;
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
            updatedDate: savedItem.updatedDate,
            version: savedItem.version,
          },
        },
      },
    };

    // console.log('handleUpdateRecordEvent returning', event, response)
    this.server?.emit(event, response);
    return response;
  }

  @SubscribeMessage('create-record')
  async handleCreateRecordEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const { appKey, appInstance, collectionKey, contents = {} } = body;

    // console.log('handleCreateRecordEvent', body)
    const event = `subscriptions-${body.appKey}`;

    const newItem = plainToClass(AppRecord, {
      appKey,
      collectionKey: Number(collectionKey),
      contents,
    });

    const savedItem = await this.appRecordRepository.save(newItem);
    // console.log('handleCreateRecordEvent new record saved', savedItem);

    const newRecord = {
      ...savedItem.contents,
      createdDate: savedItem.createdDate,
      updatedDate: savedItem.updatedDate,
      version: savedItem.version,
    };

    const response = {
      appInstance,
      // client: client.id, // drop so client can respone to it's own insert events. Not sure when a client would not need to.
      i: {
        appKey,
        collectionKey,
        records: {
          [savedItem.id]: newRecord,
        },
      },
    };

    // console.log('handleCreateRecordEvent returning', event, response)
    this.server?.emit(event, response);
    return response;
  }

  @SubscribeMessage('create-collection')
  async handleCreateCollection(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const { appKey, name, displayName } = body;

    // console.log('handleCreateCollection', body)

    const event = `subscriptions-${appKey}`;

    const newItem = plainToClass(AppCollection, {
      appKey,
      contents: {
        name,
        display_name: displayName,
        fields: {},
      },
    });

    const savedAppCollection = await this.appCollectionRepository.save(newItem);

    const collection = { schema: savedAppCollection.contents, records: {} };
    // console.log('handleCreateCollection', savedCollection)
    // console.log('handleGetCollectionEvent', body, collectionEntity)

    const response = {
      l: { collectionKey: savedAppCollection.id, ...collection },
    };

    // console.log('handleCreateCollection returning', event, response)

    this.server?.emit(event, response);

    await this.handleGetCollectionListEvent({ appKey }, client);
  }

  @SubscribeMessage('create-collection-schema-field')
  async handleCreateCollectionSchemaField(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const { appKey, appInstance, collectionKey, field } = body;

    // console.log('handleCreateCollectionSchemaField', body)

    const event = `subscriptions-${appKey}`;

    const collectionEntity = await this.appCollectionRepository.findOneBy({
      id: body.collectionKey,
      appKey: body.appKey,
    });

    const newFieldId = uuidv4();

    collectionEntity.contents['fields'][newFieldId] = field;

    await this.appCollectionRepository.update(
      collectionEntity.id,
      collectionEntity,
    );

    // console.log('handleCreateCollectionSchemaField', updatedCollection)

    const response = {
      appInstance,
      l: {
        collectionKey: collectionKey,
        schema: collectionEntity.contents,
      },
    };

    // console.log('handleCreateCollectionSchemaField returning', event, response)

    this.server?.emit(event, response);
  }

  @SubscribeMessage('copy-collection')
  async handleCopyCollection(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const { appKey, source_app, source_collection, name, displayName } = body;

    // console.log('handleCreateCollection', body)

    const event = `subscriptions-${appKey}`;

    const collectionEntity = await this.appCollectionRepository.findOneBy({
      id: source_collection,
      appKey: source_app,
    });

    const newItem = plainToClass(AppCollection, {
      appKey,
      contents: {
        name,
        display_name: displayName,
        fields: {},
      },
    });

    Object.entries((collectionEntity.contents as any).fields).forEach(
      ([fieldKey, field]) => {
        const newFieldId = uuidv4();
        (newItem.contents as any).fields[newFieldId] = field;
      },
    );

    // console.log(newItem);

    const savedAppCollection = await this.appCollectionRepository.save(newItem);

    const collection = { schema: savedAppCollection.contents, records: {} };
    // console.log('handleCreateCollection', savedCollection)
    // console.log('handleGetCollectionEvent', body, collectionEntity)

    const response = {
      l: { collectionKey: savedAppCollection.id, ...collection },
    };

    // console.log('handleCreateCollection returning', event, response)

    this.server?.emit(event, response);

    await this.handleGetCollectionListEvent({ appKey }, client);
  }

  @SubscribeMessage('copy-record')
  async handleCopyRecord(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const {
      appKey,
      appInstance,
      source_app_key,
      source_collection_key,
      source_record_key,
      target_app_key,
      target_collection_key,
    } = body;

    // console.log('handleCopyRecord', body);

    const event = `subscriptions-${appKey}`;

    const sourceCollectionEntity = await this.appCollectionRepository.findOneBy(
      {
        id: source_collection_key,
        appKey: source_app_key,
      },
    );

    const sourceRecordEntity = await this.appRecordRepository.findOneBy({
      id: source_record_key,
      collectionKey: source_collection_key,
      appKey: source_app_key,
    });

    const targetCollectionEntity = await this.appCollectionRepository.findOneBy(
      {
        id: target_collection_key,
        appKey: target_app_key,
      },
    );

    // console.log('handleCopyRecord sourceRecordEntity', sourceRecordEntity);
    // console.log(
    //   'handleCopyRecord targetCollectionEntity',
    //   targetCollectionEntity,
    // );

    const newItem = plainToClass(AppRecord, {
      appKey: target_app_key,
      collectionKey: Number(target_collection_key),
      contents: {},
    });

    const sourceCollectionFields = Object.entries(
      (sourceCollectionEntity.contents as any).fields,
    );
    // console.log(
    //   'handleCopyRecord sourceCollectionFields',
    //   sourceCollectionFields,
    // );

    Object.entries((targetCollectionEntity.contents as any).fields).forEach(
      ([fieldKey, field]: [string, any]) => {
        const sourceCollectionField = sourceCollectionFields.find(
          ([_, sourceField]: [string, any]) => sourceField.name === field.name,
        );

        const source_value =
          sourceRecordEntity.contents[sourceCollectionField[0]];
        (newItem.contents as any)[fieldKey] = source_value;
      },
    );

    const savedItem = await this.appRecordRepository.save(newItem);
    // console.log('handleCopyRecord new record saved', savedItem);

    const newRecord = {
      ...savedItem.contents,
      createdDate: savedItem.createdDate,
      updatedDate: savedItem.updatedDate,
      version: savedItem.version,
    };

    const response = {
      appInstance,
      // client: client.id, // drop so client can respone to it's own insert events. Not sure when a client would not need to.
      i: {
        appKey,
        collectionKey: target_collection_key,
        records: {
          [savedItem.id]: newRecord,
        },
      },
    };

    // console.log('handleCopyRecord returning', event, response)
    this.server?.emit(event, response);
    return response;
  }

  @SubscribeMessage('delete-records')
  async handleDeleteRecordsEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const { appKey, appInstance, recordKeys } = body;

    // console.log('handleDeleteRecordEvent', body)
    const event = `subscriptions-${appKey}`;

    const deletedRecords = {};

    recordKeys.forEach((recordKey) => (deletedRecords[recordKey] = recordKey));

    await this.appRecordRepository.delete(recordKeys);

    const response = {
      appInstance,
      client: client.id,
      d: {
        collectionKey: body.collectionKey,
        records: deletedRecords,
      },
    };

    // console.log('handleDeleteRecordEvent returning', event, response)
    this.server?.emit(event, response);
    return response;
  }

  @SubscribeMessage('mouse-moved')
  async handleMouseMoveEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    // console.log('handleMouseMoveEvent', body)
    const event = `mouse-moved-${body.appKey}`;

    const response = { ...body };

    // console.log('handleMouseMoveEvent returning', event, response)
    // console.log('handleMouseMoveEvent returning', event, body.x, body.y)
    this.server?.emit(event, response);
    return response;
  }
}