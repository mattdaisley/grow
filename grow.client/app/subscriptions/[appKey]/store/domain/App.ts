import { Collection, ICollection } from './Collection';
import { IPlugin, Plugin } from './Plugin';

import {Socket} from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import { Record } from './Record';

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

  private _appState: { [key: string]: Record } = {};

  private _referencedApps: {
    [key: string]: App;
  }
  private _collections: {
    [key: string]: Collection;
  };
  private _app_display_list: Collection;
  private _plugins_display_list: Collection;
  private _collections_display_list: Collection;
  private _subscriptions: {
    [selector: string]: Function[]
  };

  private _socket: Socket;

  constructor({ key, plugins, collections }: IApp, socket: Socket) {
    this._instance = uuidv4()

    // console.log('App constructor app key:', key);
    this.key = key;
    this._plugins = plugins;
    this.plugins = this._createPlugins(plugins);
    this._collections = this._createCollections(collections);
    this._referencedApps = {};
    this._subscriptions = {};

    this._socket = socket;

    // console.log('registering socket listener', `subscriptions-${this.key}`)
    this._socket.on(`subscriptions-${this.key}`, (data) => {
      // console.log(`subscriptions-${this.key}`, data, this._socket.id);
      if (this._socket.id === data.client && this._instance === data.appInstance) {
        return;
      }

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
    // console.log('unregistering socket listener', `subscriptions-${this.key}`)
    this._socket.off(`subscriptions-${this.key}`);
  }

  public getAppInstance() {
    return this._instance;
  }

  public getAppDisplayList(): Collection {
    if (!this._app_display_list) {
      // console.log(`App ${this.key}: ${this._instance} getAppDisplayList not found`)
      this._emitEvent('get-app-list')

      this._app_display_list = new Collection(this, {key: `${this.key}.al`, schema: undefined, records: undefined, type: 'app_list'});
    }

    return this._app_display_list;
  }

  public getReferencedApp(appKey: string): App {
    if (appKey === this.key) {
      return this;
    }
    
    if (!this._referencedApps[appKey]) {
      this._referencedApps[appKey] = new App({ key: appKey, plugins: {}, collections: {} }, this._socket);
    }

    return this._referencedApps[appKey];
  }

  public getReferencedAppCollection(appKey: string, collectionKey: string): Collection {
    const app = this.getReferencedApp(appKey);

    return app.getCollection(collectionKey);
  }

  public getPluginDisplayList(): Collection {
    if (!this._plugins_display_list) {
      // console.log(`App ${this.key}: ${this._instance} getPluginDisplayList not found`)
      this._emitEvent('get-plugin-list')

      this._plugins_display_list = new Collection(this, {key: `${this.key}.pl`, schema: undefined, records: undefined, type: 'plugin_list'});
    }

    // console.log(`App ${this.key}: ${this._instance}`, this._plugins_display_list)
    return this._plugins_display_list;
  }

  public getCollectionDisplayList(): Collection {
    if (!this._collections_display_list) {
      // console.log(`App ${this.key}: ${this._instance} getCollectionDisplayList not found`)
      this._emitEvent('get-collection-list')

      this._collections_display_list = new Collection(this, {key: `${this.key}.cl`, schema: undefined, records: undefined, type: 'collection_list'});
    }

    return this._collections_display_list;
  }

  public getCollection(collectionKey: string): Collection {
    if (!this._collections[collectionKey]) {
      // console.log(`App ${this.key}: ${this._instance} getCollection key not found`, collectionKey)
      this._emitEvent('get-collection', { collectionKey });

      this._collections[collectionKey] = new Collection(this, {key: collectionKey, schema: undefined, records: undefined});
    }

    return this._collections[collectionKey];
  }

  public pushRecordUpdate(collectionKey: string, recordKey: string, fieldKey: string, newValue: any) {
    this._emitEvent('update-record', { collectionKey, recordKey, fieldKey, newValue });
  }

  private _emitEvent(event: string, data: any = {}) {
    let eventData = {
      appKey: this.key,
      appInstance: this._instance,
      ...data
    };


    this._socket.emit(event, eventData);
  }

  handleEvent(data: any) {
    // console.log('App handleEvent', data, JSON.stringify(Object.keys(this._collections)));
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      const collection = this._collections[value.collectionKey];
      // console.log('App handleEvent', key, value, collection)
      switch (key) {
        case 'l':
          collection?.setCollection(value);
          break;
        case 'i':
          Object.entries(value.records).forEach(([recordKey, record]) => {
            collection?.addRecord(recordKey, record);
          });
          break;
        case 'd':
          Object.entries(value.records).forEach(([recordKey, record]) => {
            collection?.removeRecord(recordKey);
          });
          break;
        case 'u':
          Object.entries(value.records).forEach(([recordKey, record]) => {
            collection?.updateRecord(recordKey, record);
          });
          break;
        case 'al':
          if (this._app_display_list) {
            this._app_display_list.setCollection({ schema: value.schema, records: value.records });
          }
          break;
        case 'cl':
          if (this._collections_display_list) {
            this._collections_display_list.setCollection({ schema: value.schema, records: value.records });
          }
          break;
        case 'pl':
          if (this._plugins_display_list) {
            this._plugins_display_list.setCollection({ schema: value.schema, records: value.records });
          }
          break;
        default:
          console.log('Unknown event type', key, value);
      }
    });
  }

  public getFromAppState(key: string): Record {
    if (!this._appState.hasOwnProperty(key)) {
      this._appState[key] = new Record(this, undefined, {
        schema: {
          name: "",
          display_name: "",
          fields: {
            [key]: {
              type: "string",
              name: key
            }
          }
        },
        key,
        record: { [key]: undefined }
      });
    }

    return this._appState[key];
  }

  subscribe(selector: string, callback: Function) {

    // console.log('record subscribe', selector, this.key)
    if (!this._subscriptions[selector]) {
      this._subscriptions[selector] = [];
    }
    this._subscriptions[selector].push(callback);
  }

  unsubscribe(selector: string, callback: Function) {

    if (this._subscriptions[selector]) {
      this._subscriptions[selector] = this._subscriptions[selector].filter(cb => cb !== callback);
    }

    if (Object.keys(this._referencedApps).length) {
      Object.entries(this._referencedApps).forEach(([appKey, app]) => {
        app.unsubscribeAll();
      });
    }
  }

  unsubscribeAll() {
    Object.entries(this._subscriptions).forEach(([selector, callbacks]) => {
      callbacks.forEach(cb => this.unsubscribe(selector, cb));
    });
  }

  private _notifySubscribers(type: string) {

    Object.entries(this._subscriptions).forEach(([selector, callbacks]) => {
      if (type === '*' || selector === type) {
        // console.log("Record _notifySubscribers", selector, type, callbacks.length)
        callbacks.forEach(cb => cb(this.getFromAppState(selector)))
      }
    });
  }
}
