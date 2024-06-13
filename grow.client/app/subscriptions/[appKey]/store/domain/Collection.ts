import { App } from './App';
import { Record } from './Record';
import { ISchema } from './ISchema';

export interface ICollection {
  schema: ISchema;
  records: {
    [key: string]: Object;
  }
}

export class Collection<TRecordValue extends Object = any> {
  key: string;
  schema: ISchema;
  type: string;
  records: {
    [key: string]: Record<TRecordValue>;
  };

  private _app: App;
  private _fields_display_list: Collection;
  private _record_display_list: Collection;
  private _subscriptions: {
    [selector: string]: Function[];
  };

  constructor(app: App, { key, schema, records, type = "collection" }) {
    this._app = app;
    this.key = key;
    this.schema = schema;
    this.type = type;
    this._subscriptions = {};

    !!records && this._initializeRecords(records);
  }

  _initializeRecords(records: { [key: string]: object }) {
    this.records = {};

    Object.entries(records).forEach(([recordKey, record]) => {
      this.records[recordKey] = new Record(this._app, this, {
        schema: this.schema,
        key: recordKey,
        record,
      });
    });
  }

  public createSchemaField({ name, type }) {
    this._app.pushCreateCollectionSchemaField(this.key, { name, type });
  }

  public createRecord(contents) {
    this._app.pushCreateRecord(this.key, contents);
  }

  public deleteRecords(recordKeys: string[]) {
    this._app.pushDeleteRecords(this.key, recordKeys);
  }

  setCollection(collection: ICollection) {
    // console.log('Collection setCollection', collection)

    this.schema = {
      ...collection.schema,
      fields: {
        ...collection.schema.fields,
        createdDate: { type: "date", name: "createdDate", readonly: true },
        updatedDate: { type: "date", name: "updatedDate", readonly: true },
        version: { type: "number", name: "version", readonly: true },
      },
    };
    if (!!collection.records) {
      this._initializeRecords(collection.records);
      this._setRecordsDisplayListRecords();
    } else {
      Object.values(this.records).forEach((record) => {
        record.setSchema(this.schema);
      });
    }

    if (this.schema?.fields !== undefined) {
      this._setFieldsDisplayListRecords();
    }

    this._notifySubscribers("*");
  }

  addRecord(recordKey: string, record: any) {
    // console.log('Collection addRecord', recordKey, record)
    this.records = {
      ...this.records,
      [recordKey]: new Record(this._app, this, {
        schema: this.schema,
        key: recordKey,
        record,
      }),
    };

    this._notifySubscribers("*");
  }

  removeRecord(recordKey: string) {
    this.records = { ...this.records };
    delete this.records[recordKey];

    this._notifySubscribers("*");
  }

  updateRecord(recordKey: string, record: any, isSelfUpdate = false) {
    // console.log('Collection updateRecord', recordKey, record)
    if (this.records[recordKey] !== undefined) {
      this.records[recordKey].update(record, isSelfUpdate);
    }
  }

  getFieldsDisplayList(): Collection {
    if (!this._fields_display_list) {
      this._createFieldsDisplayList();
    }

    return this._fields_display_list;
  }

  _createFieldsDisplayList() {
    const collectionDefinition = {
      key: `${this.key}.fl`,
      schema: {
        fields: {
          display_name: { type: "string", name: "display_name" },
          type: { type: "string", name: "type" },
        },
      },
      records: {},
      type: "collection_field_list",
    };

    this._fields_display_list = new Collection(this._app, collectionDefinition);

    if (this.schema?.fields !== undefined) {
      this._setFieldsDisplayListRecords();
    }
  }

  _setFieldsDisplayListRecords() {
    // if it's undefined no one has asked for it yet so wait until they do
    if (this._fields_display_list !== undefined) {
      const records = {};

      Object.entries(this.schema.fields).forEach(([fieldKey, field]) => {
        records[fieldKey] = {
          display_name: `${field.name} (${field.type})`,
          type: field.type,
        };
      });

      // console.log("Collection getFieldsDisplayList", collectionDefinition);
      this._fields_display_list.setCollection({
        schema: this._fields_display_list.schema,
        records,
      });
    }
  }

  getRecordsDisplayList(): Collection {
    if (!this._record_display_list) {
      this._createRecordsDisplayList();
    }

    return this._record_display_list;
  }

  _createRecordsDisplayList() {
    const collectionDefinition = {
      key: `${this.key}.fl`,
      schema: {
        fields: {
          display_name: { type: "string", name: "display_name" },
        },
      },
      records: {},
      type: "collection_record_list",
    };

    this._record_display_list = new Collection(this._app, collectionDefinition);

    if (this.records !== undefined) {
      this._setRecordsDisplayListRecords();
    }
  }

  _setRecordsDisplayListRecords() {
    // if it's undefined no one has asked for it yet so wait until they do
    if (this._record_display_list !== undefined) {
      const records = {};

      Object.entries(this.records).forEach(([key, record]) => {
        records[key] = {
          display_name: `${record.key}`,
        };
      });

      // console.log("Collection getFieldsDisplayList", collectionDefinition);
      this._record_display_list.setCollection({
        schema: this._record_display_list.schema,
        records,
      });
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
      this._subscriptions[selector] = this._subscriptions[selector].filter(
        (cb) => cb !== callback
      );
    }
  }

  private _notifySubscribers(type: string) {
    Object.entries(this._subscriptions).forEach(([selector, callbacks]) => {
      if (type === "*") {
        // console.log('Collection _notifySubscribers', selector, this.records)
        callbacks.forEach((cb) => cb(this.records));
      }
    });
  }
}


