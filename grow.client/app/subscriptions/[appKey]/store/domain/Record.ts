import { App } from './App';
import { Collection } from './Collection';
import { ISchema } from './Schema';


export class Record {
  key: string;
  schema: ISchema;
  _record: object;

  private _app: App;
  private _collection: Collection;
  private _subscriptions: { 
    [selector: string]: Function[] 
  };

  constructor(app: App, collection: Collection, {schema, key, record}: {schema: ISchema, key: string, record: object}) {
    this._app = app;
    this._collection = collection;
    this.key = key;
    this.schema = schema;
    this._record = record;
    this._subscriptions = {};
  }

  _callbacks: { [key: string]: Function } = {};
  _referencedFields: {};

  get value(): Object {
    
    const fields = {};

    Object.entries(this._record).forEach(([fieldKey, fieldValue]) => {
      const field = this.schema.fields[fieldKey];
      // console.log('record field', fieldKey, field, this._record[fieldKey], this.schema.fields)

      if (fieldKey === 'createdDate' || fieldKey === 'updatedDate') {
        fields[fieldKey] = new Date(this._record[fieldKey]);
        return;
      }

      if (field.type === 'collection') {
        const fieldValue = this._record[fieldKey];
        // console.log('record field', fieldKey, field, this._record)
        // const collection = this._app.collections[this._record[fieldKey]];
        const collection = this._app.getCollection(fieldValue);
        // console.log('record collection', field.name, collection)
        fields[field.name] = collection;
        return; 
      }
      
      if (field.type === 'app_collection') {
        const fieldValue = this._record[fieldKey];
        const valueSplit = fieldValue.split('.');
        if (valueSplit.length > 1 && valueSplit[0] === 'app') {
          // console.log('Record.value app_collection', valueSplit)
          // console.log(valueSplit);

          const collection = this._app.getReferencedAppCollection(valueSplit[1], valueSplit[3])
          fields[field.name] = collection;
          return;
        }

        if (valueSplit.length > 1 && valueSplit[0] === 'appState') {
          // console.log('Record.value app_collection appState', valueSplit)

          const appStateRecord: Record = this._app.getFromAppState(valueSplit[1])

          if (!this._callbacks.hasOwnProperty(valueSplit[1])) {

            const callback = (newRecord: Record) => {
              // console.log('record value callback', valueSplit[1], fieldValue, newRecord)
              this._notifySubscribers(field.name)
              // setValue((currentValue) => ({...currentValue, [key]: { ...currentValue[key], value: newRecord.value[field]}}));
              // setValue({...value, [field]: newRecord.value[field]});
            }

            this._callbacks[valueSplit[1]] = callback;
            appStateRecord.subscribe(valueSplit[1], callback);
          }

          // console.log('Record.value app_collection collectionKeySplit', appStateRecord);
          const collectionKeySplit = appStateRecord?.value?.[valueSplit[1]]?.split('.');
          if (collectionKeySplit && collectionKeySplit.length > 1 && collectionKeySplit[0] === 'app') {
            const collection = this._app.getReferencedAppCollection(collectionKeySplit[1], collectionKeySplit[3])
            fields[field.name] = collection;
            return;
          }
        }
      }

      if (field.type === 'app_collection_list') {
        const fieldValue = this._record[fieldKey];
        const valueSplit = fieldValue.split('.');
        if (valueSplit.length > 1 && valueSplit[0] === 'app') {
          // console.log('Record.value app_collection_list', valueSplit)
          // console.log(valueSplit);

          const app = this._app.getReferencedApp(valueSplit[1])
          fields[field.name] = app.getCollectionDisplayList();
          return;
        }

      }

      if (field.type === 'app_list') {
        // value doesn't currently matter. Just returns all apps.
        // could be used to filter apps in the future.
        const fieldValue = this._record[fieldKey];

        fields[field.name] = this._app.getAppDisplayList();
        // console.log('Record.app_list', fieldValue, fields[field.name])
        return;

      }
      
      fields[field.name] = fieldValue;

    });

    return fields;
  }

  update(record: object) {

    const difference = Object.keys(record).filter(k => this._record[k] !== record[k]);

    this._record = { ...this._record, ...record };

    difference.forEach(k => this._notifySubscribers(this.schema.fields[k].name));
  }

  updateField(fieldName: string, newValue: any) {
    // console.log('updateField', fieldName, newValue, this._record)
    const newRecord = { ...this._record };

    Object.entries(this._record).forEach(([fieldKey, fieldValue]) => {
      const field = this.schema.fields[fieldKey];

      if (field.name === fieldName && fieldValue !== newValue) {
        newRecord[fieldKey] = newValue;
        // this._record[fieldKey] = newValue;
        // this._notifySubscribers(fieldName)

        if (this._collection?.key) {
          this._app.pushRecordUpdate(this._collection.key, this.key, fieldKey, newValue)
        }
      }
    });

    this.update(newRecord);

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
    // console.log("Record _notifySubscribers", this._subscriptions)
    Object.entries(this._subscriptions).forEach(([selector, callbacks]) => {
      if (type === '*' || selector === type) {
        // console.log("Record _notifySubscribers", selector, type, callbacks.length)
        callbacks.forEach(cb => cb(this))
      }
    });
  }
}
