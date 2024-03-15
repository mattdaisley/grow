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

export interface Collection {
  schema: {
    type: string;
    name: string;
    fields: object;
    display_name: string;
  };
  records: object
}