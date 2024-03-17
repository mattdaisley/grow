import { App, getApp } from './getApp';

export async function getCollection(app: App, schemaType: string): Promise<Collection>{
  return new Promise((resolve) => {
    setTimeout(async () => {
      const collections = app.collections;
      const collectionKey = (Object.keys(collections)).find((key) => collections[key].schema.type === schemaType);
      resolve(collections[collectionKey]);
    }, 100);
  });
}

export interface ICollection {
  schema: {
    type: string;
    name: string;
    fields: object;
    display_name: string;
  };
  records: object
}

export class Collection {
  schema: {
    type: string;
    name: string;
    fields: object;
    display_name: string;
  };
  _records: object

  constructor({ schema, records }) {
    this.schema = schema;
    this._records = records;
  }

  get records() {
    const recordsMapped = {};

    Object.keys(this._records).forEach((recordKey) => {
      const record = this._records[recordKey];
      const fields = {};
      
      Object.keys(record).forEach((fieldKey) => {
        const field = this.schema.fields[fieldKey];
        fields[field.name] = record[fieldKey];
      });
      
      recordsMapped[recordKey] = { ...fields };
    });

    return recordsMapped;
  }
}
