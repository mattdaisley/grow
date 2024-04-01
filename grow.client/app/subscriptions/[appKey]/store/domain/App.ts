import { Collection, ICollection } from './Collection';
import { IPlugin, Plugin } from './Plugin';

import {Socket} from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

export interface IApp {
  key: string;
  plugins: {
    [key: string]: Plugin;
  };
  collections: {
    [key: string]: Collection;
  };
}


export class App {
  private _instance: string;
  key: string;
  _plugins: {
    [key: string]: Object;
  };
  plugins: {
    [key: string]: Plugin;
  };
  private _collections: {
    [key: string]: Collection;
  };

  private _socket: Socket;

  constructor({ key, plugins, collections }: IApp, socket: Socket) {
    this._instance = uuidv4()

    // console.log('App constructor app key:', key);
    this.key = key;
    this._plugins = plugins;
    this.plugins = this._createPlugins(plugins);
    this._collections = this._createCollections(collections);

    this._socket = socket;

    this._socket.on("subscriptions", (data) => {
      // console.log("subscriptions", data);
      this.handleEvent(data);
    });
  }

  private _createPlugins(plugins: { [key: string]: IPlugin; }) {
    const pluginMap = {};
    for (const [key, value] of Object.entries(plugins)) {
      pluginMap[key] = new Plugin(this, { key, ...value });
    }
    return pluginMap;
  }

  private _createCollections(collections: { [key: string]: ICollection; }) {
    const collectionMap = {};
    for (const [collectionKey, collection] of Object.entries(collections)) {
      collectionMap[collectionKey] = new Collection(this, {key: collectionKey, ...collection});
    }
    return collectionMap;
  }

  public unregisterMessageListeners() {
    this._socket.off(`subscriptions`);
  }

  public get collections() {
    return this._collections;
  }

  public getCollection(collectionKey: string): Collection {
    if (!this.collections[collectionKey]) {
      // console.log(`App ${this._instance} getCollection key not found`, collectionKey)
      this._socket.emit('get-collection', { appKey: this.key, collectionKey });

      this._collections[collectionKey] = new Collection(this, {key: collectionKey, schema: undefined, records: undefined});
    }

    return this.collections[collectionKey];
  }

  handleEvent(data: any) {
    // console.log('App handleEvent', data, JSON.stringify(Object.keys(this._collections)));
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      const collection = this._collections[value.collectionKey];
      switch (key) {
        case 'l':
          collection.setCollection(value);
          break;
        case 'i':
          Object.entries(value.records).forEach(([recordKey, record]) => {
            collection.addRecord(recordKey, record);
          });
          break;
        case 'd':
          Object.entries(value.records).forEach(([recordKey, record]) => {
            collection.removeRecord(recordKey);
          });
          break;
        case 'u':
          Object.entries(value.records).forEach(([recordKey, record]) => {
            collection.updateRecord(recordKey, record);
          });
          break;
      }
    });
  }
}
