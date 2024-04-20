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

  get rawValue(): Object {
    
    const fields = {};

    Object.entries(this._record).forEach(([fieldKey, fieldValue]) => {
      const field = this.schema.fields[fieldKey];
      // console.log('record field', fieldKey, field, this._record[fieldKey], this.schema.fields)

      if (fieldKey === 'createdDate' || fieldKey === 'updatedDate') {
        fields[fieldKey] = new Date(this._record[fieldKey]);
        return;
      }

      if (field.type === 'collection') {
        // console.log('record field', fieldKey, field, this._record)
        // const collection = this._app.collections[this._record[fieldKey]];
        const collection = this._app.getCollection(fieldValue);
        // console.log('record collection', field.name, collection)
        fields[field.name] = collection;
        return; 
      }

      if (field.type === 'app_list') {
        // value doesn't currently matter. Just returns all apps.
        // could be used to filter apps in the future.

        fields[field.name] = this._app.getAppDisplayList();
        // console.log('Record.app_list', fieldValue, fields[field.name])
        return;

      }
      
      fields[field.name] = fieldValue;

    });

    return fields;
  }

  get value(): Object {
    
    const fields = this.rawValue;

    Object.entries(this._record).forEach(([fieldKey, fieldValue]) => {
      const field = this.schema.fields[fieldKey];

      let patternValue: string = fieldValue

      var pattern = new RegExp("({{ *([a-zA-Z0-9-_.]*) *}})", "g");
      var match;
      var selectors = [];
      while ((match = pattern.exec(fieldValue)) !== null) {
        selectors.push(match[1]); // push the nested group to the selectors array
      }
      if (selectors.length > 0) {
        // console.log("Record value selectors", selectors, fieldValue); // logs an array of all matched selectors

        selectors.forEach((selector) => {
          const appRecordRegex =
            /a\.([a-zA-Z0-9-_]+)\.c.([a-zA-Z0-9-_]+)\.r\.([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]+)/;
          const appRecordMatches = selector.match(appRecordRegex);
          if (appRecordMatches) {
            const appRecordValue = this._getAppRecordValue(appRecordMatches, fieldValue, field);
            // console.log('Record.value appRecordValue',  appRecordValue, selector)
            if (appRecordValue !== undefined) {
              patternValue = patternValue.replace(selector, appRecordValue);
            }
          }

          const appStateRegex = /appState\.([a-zA-Z0-9-_]+)/;
          const appStateMatches = selector.match(appStateRegex);
          if (appStateMatches) {
            const appStateValue = this._getAppStateValue(appStateMatches, field);
            // console.log('Record.value appStateValue',  appStateValue, selector)
            if (appStateValue !== undefined) {
              patternValue = patternValue.replace(selector, appStateValue);
            }
          }
        });

        if (pattern.exec(patternValue) !== null) {
          // not able to replace all selectors
          // console.log('Record.value not able to replace all selectors', patternValue);
          fields[field.name] = patternValue
          return;
        }

        fields[field.name] = patternValue
      }

      if (patternValue !== undefined && typeof patternValue === 'string') {
        // console.log('Record.value after possible selectors', patternValue, field.type);

        if (field.type === 'app_collection_list') {
          // console.log('Record.value app_collection_list', patternValue);
          const valueSplit = patternValue.split('.');
          if (valueSplit.length > 1 && valueSplit[0] === 'app') {
            // console.log('Record.value app_collection_list', valueSplit)
            // console.log(valueSplit);

            const app = this._app.getReferencedApp(valueSplit[1])
            fields[field.name] = app.getCollectionDisplayList();
            return;
          }
        }

        if (field.type === 'app_collection') {
          const collectionKeySplit = patternValue.split('.');
          if (collectionKeySplit && collectionKeySplit.length > 1 && collectionKeySplit[0] === 'app' && collectionKeySplit[2] === 'collections') {
            // console.log('Record.value app_collection_list', collectionKeySplit)
            const collection = this._app.getReferencedAppCollection(collectionKeySplit[1], collectionKeySplit[3])
            fields[field.name] = collection;
            return;
          }
        }

        // fields[field.name] = patternValue;
      }

      // console.log('Record value patternValue', `"${fieldValue}"`, `"${patternValue}"`)
    });

    return fields;
  }

  private _getAppRecordValue(matches: any, fieldValue: any, field: any) {
    const appKey = matches[1];
    const collectionKey = matches[2];
    const recordKey = matches[3];
    const nestedFieldKey = matches[4];
    // console.log(
    //   "Record value match group properties",
    //   matches,
    //   appKey,
    //   collectionKey,
    //   recordKey,
    //   nestedFieldKey
    // );
    let nestedCollection: Collection;
    if (appKey === this._app.key) {
      nestedCollection = this._app.getCollection(collectionKey);
    }
    else {
      nestedCollection = this._app.getReferencedAppCollection(appKey, collectionKey);
    }

    const nestedCollectionCallbacksKey = `${appKey}.${collectionKey}`;
    if (!this._callbacks.hasOwnProperty(nestedCollectionCallbacksKey)) {

      const callback = (_: Record) => {
        // console.log("nested collection callback")
        this._notifySubscribers(field.name);
      };

      this._callbacks[nestedCollectionCallbacksKey] = callback;
      nestedCollection.subscribe('*', callback);
    }

    // console.log("Record value nestedCollection", nestedCollection?.records, nestedCollection?.records?.hasOwnProperty(recordKey))
    if (nestedCollection) {
      if (nestedCollection.records?.hasOwnProperty(recordKey)) {
        const nestedRecord = nestedCollection.records[recordKey];
        const nestedField = nestedRecord.schema.fields[nestedFieldKey];
        // console.log("Record value nestedRecord", nestedRecord, nestedFieldKey, nestedField)
        if (nestedField) {
          const callbacksKey = `${appKey}.${collectionKey}.${recordKey}.${nestedFieldKey}`;

          if (!this._callbacks.hasOwnProperty(callbacksKey)) {

            const callback = (_: Record) => {
              // console.log("nested record callback")
              this._notifySubscribers(field.name);
            };

            this._callbacks[callbacksKey] = callback;
            nestedRecord.subscribe(nestedField.name, callback);
          }

          return nestedRecord.value[nestedField.name];
        }
      }
    }
  }

  private _getAppStateValue(matches: any, field: any): string {
    const appStateKey = matches[1];
    const appStateRecord: Record = this._app.getFromAppState(appStateKey)

    if (!this._callbacks.hasOwnProperty(appStateKey)) {

      const callback = (newRecord: Record) => {
        // console.log('record value callback', appStateKey, newRecord)
        this._notifySubscribers(field.name)
        // setValue((currentValue) => ({...currentValue, [key]: { ...currentValue[key], value: newRecord.value[field]}}));
        // setValue({...value, [field]: newRecord.value[field]});
      }

      this._callbacks[appStateKey] = callback;
      appStateRecord.subscribe(appStateKey, callback);
    }

    return appStateRecord?.value?.[appStateKey];
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
