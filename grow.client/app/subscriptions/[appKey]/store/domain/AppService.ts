import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

export class AppService {
  key: string;
  private _socket: Socket;

  private _instance: string;
  private _subscriptions: {
    [selector: string]: Function[];
  } = {};

  constructor(appKey: string, socket: Socket) {
    this.key = appKey;
    this._socket = socket;

    this._instance = uuidv4();

    // console.log('registering socket listener', `subscriptions-${this.key}`)
    this._socket.on(`subscriptions-${this.key}`, (data) => {
      // console.log(`subscriptions-${this.key}`, data, this._socket.id);
      this._handleEvent(data);
    });
  }

  public getSocket() {
    return this._socket;
  }

  public getAppList() {
    this._emitEvent("get-app-list");
  }

  public getCollection(collectionKey: string) {
    this._emitEvent("get-collection", { collectionKey });
  }

  public getCollectionList() {
    this._emitEvent("get-collection-list");
  }

  public getPluginList() {
    this._emitEvent("get-plugin-list");
  }

  public copyCollection(
    source_app: string,
    source_collection: string,
    newCollection: { name: string; displayName: string }
  ) {
    console.log(
      "pushCopyCollection",
      source_app,
      source_collection,
      newCollection
    );
    this._emitEvent("copy-collection", {
      source_app,
      source_collection,
      ...newCollection,
    });
  }

  public createCollection(createCollectionOptions: {
    name: string;
    displayName: string;
  }) {
    this._emitEvent("create-collection", createCollectionOptions);
  }

  public createCollectionSchemaField(collectionKey: string, field: any) {
    this._emitEvent("create-collection-schema-field", { collectionKey, field });
  }

  public createRecord(createRecordOptions: {
    collectionKey: string;
    contents: { [key: string]: any };
  }) {
    this._emitEvent("create-record", createRecordOptions);
  }

  public updateRecord(updateRecordOptions: {
    collectionKey: string;
    recordKey: string;
    fieldKey: string;
    newValue: any;
  }) {
    this._emitEvent("update-record", updateRecordOptions);
  }

  public deleteRecords(deleteRecordOptions: {
    collectionKey: string;
    recordKeys: string[];
  }) {

    this._emitEvent("delete-records", deleteRecordOptions);
  }

  private _handleEvent(data: any) {
    // console.log('App handleEvent', data, JSON.stringify(Object.keys(this._collections)));
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      const allowedSelfUpdateKeys = ["i", "u", "d"];
      let isSelfUpdate =
        this._socket.id === data.client && this._instance === data.appInstance;
      if (!allowedSelfUpdateKeys.includes(key) && isSelfUpdate) {
        return;
      }

      this._notifySubscribers("*", key, value, isSelfUpdate);
    });
  }

  public _emitEvent(event: string, data: any = {}) {
    let eventData = {
      appKey: this.key,
      appInstance: this._instance,
      ...data,
    };

    this._socket.emit(event, eventData);
  }

  public subscribe(selector: string, callback: Function) {
    // console.log('record subscribe', selector, this.key)
    if (!this._subscriptions[selector]) {
      this._subscriptions[selector] = [];
    }
    this._subscriptions[selector].push(callback);
  }

  public unsubscribe(selector: string, callback: Function) {
    if (this._subscriptions[selector]) {
      this._subscriptions[selector] = this._subscriptions[selector].filter(
        (cb) => cb !== callback
      );
    }
  }

  private _notifySubscribers(
    type: string,
    key: string,
    value: any,
    isSelfUpdate: boolean
  ) {
    // console.log("Record _notifySubscribers", type, this._subscriptions)
    Object.entries(this._subscriptions).forEach(([selector, callbacks]) => {
      if (type === "*" || selector === type) {
        // console.log("Record _notifySubscribers", selector, type, callbacks.length)
        callbacks.forEach((cb) => cb(key, value, isSelfUpdate));
      }
    });
  }

  public unregisterMessageListeners() {
    console.log("Record unregisterMessageListeners", this._subscriptions);
    Object.entries(this._subscriptions).forEach(([selector, callbacks]) => {
      callbacks.forEach((cb) => this.unsubscribe(selector, cb));
    });
    // console.log('unregistering socket listener', `subscriptions-${this.key}`)
    this._socket.off(`subscriptions-${this.key}`);
  }
}
