import { App } from './App';
import { ISchema } from './Schema';


export class Record {
  key: string;
  schema: ISchema;
  _record: object;

  private _app: App;
  private _subscriptions: { 
    [selector: string]: Function[] 
  };

  constructor(app: App, {schema, key, record}: {schema: ISchema, key: string, record: object}) {
    this._app = app;
    this.key = key;
    this.schema = schema;
    this._record = record;
    this._subscriptions = {};
  }

  get value(): Object {
    
    const fields = {};

    Object.entries(this._record).forEach(([fieldKey, record]) => {
      const field = this.schema.fields[fieldKey];

      if (field.type === 'collection') {
        // console.log('record field', fieldKey, field, this._record)
        const collection = this._app.collections[this._record[fieldKey]];
        // console.log('record collection', field.name, collection)
        fields[field.name] = collection;
      }
      else {
        fields[field.name] = record;
      }

    });

    return fields;
  }

  update(record: object) {

    const difference = Object.keys(record).filter(k => this._record[k] !== record[k]);

    this._record = record;

    difference.forEach(k => this._notifySubscribers(this.schema.fields[k].name));
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
  }

  private _notifySubscribers(type: string) {

    Object.entries(this._subscriptions).forEach(([selector, callbacks]) => {
      if (type === '*' || selector === type) {
        callbacks.forEach(cb => cb(this))
      }
    });
  }
}
