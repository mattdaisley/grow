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

  private _subscriptions: { 
    [selector: string]: Function[] 
  };

  constructor({ key, schema, records }) {

    this.key = key;
    this.schema = schema;
    this._subscriptions = {};

    this._createRecords(records);
  }

  _createRecords(records: {[key: string]: object}) {

    this.records = {};

    Object.entries(records).forEach(([recordKey, record]) => {
      this.records[recordKey] = new Record(this.schema, recordKey, record);
    });
  }

  addRecord(recordKey: string, record: any) {

    this.records = { ...this.records, [recordKey]: new Record(this.schema, recordKey, record)}

    this._notifySubscribers('*');
  }

  removeRecord(recordKey: string) {

    this.records = { ...this.records };
    delete this.records[recordKey];

    this._notifySubscribers('*');
  }

  updateRecord(recordKey: string, record: any) {

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
        callbacks.forEach(cb => cb(this.records))
      }
    });
  }
}


