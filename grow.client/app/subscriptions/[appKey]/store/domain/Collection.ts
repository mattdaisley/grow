import { App } from './App';
import { Record } from './Record';
import { ISchema } from './Schema';

export interface ICollection {
  schema: ISchema;
  records: {
    [key: string]: Object;
  }
}

export class Collection {
  key: string;
  schema: ISchema;
  records: {
    [key: string]: Record;
  }

  private _app: App;
  private _subscriptions: { 
    [selector: string]: Function[] 
  };

  constructor(app: App, { key, schema, records }) {
    this._app = app;
    this.key = key;
    this.schema = schema;
    this._subscriptions = {};
    
    !!records && this._createRecords(records);
  }

  _createRecords(records: {[key: string]: object}) {

    this.records = {};

    Object.entries(records).forEach(([recordKey, record]) => {
      this.records[recordKey] = new Record(this._app, this, {schema: this.schema, key: recordKey, record});
    });
  }

  setCollection(collection: ICollection) {
    // console.log('Collection setCollection', collection)
    this.schema = { 
      ...collection.schema, 
      fields: { 
        ...collection.schema.fields,
        createdDate: { type: 'date', name: 'createdDate', readonly: true }, 
        updatedDate: { type: 'date', name: 'updatedDate', readonly: true } 
      } 
    };
    !!collection.records && this._createRecords(collection.records);

    this._notifySubscribers('*');
  }

  addRecord(recordKey: string, record: any) {
    // console.log('Collection addRecord', recordKey, record)
    this.records = { ...this.records, [recordKey]: new Record(this._app, this, {schema: this.schema, key: recordKey, record})}

    this._notifySubscribers('*');
  }

  removeRecord(recordKey: string) {

    this.records = { ...this.records };
    delete this.records[recordKey];

    this._notifySubscribers('*');
  }

  updateRecord(recordKey: string, record: any) {
    // console.log('Collection updateRecord', recordKey, record)
    if (this.records[recordKey] !== undefined) {
      this.records[recordKey].update(record);
    }
  }

  subscribe(selector: string, callback: Function) {

    if (!this._subscriptions[selector]) {
      this._subscriptions[selector] = [];
    }
    this._subscriptions[selector].push(callback);
  }

  unsubscribe(selector: string, callback: Function) {

    if (this._subscriptions[selector]) {
      this._subscriptions[selector] = this._subscriptions[selector].filter(cb => cb !== callback);
    }
  }

  private _notifySubscribers(type: string) {

    Object.entries(this._subscriptions).forEach(([selector, callbacks]) => {
      if (type === '*') {
        // console.log('Collection _notifySubscribers', selector, this.records)
        callbacks.forEach(cb => cb(this.records))
      }
    });
  }
}


