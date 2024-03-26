"use client";

import { useEffect, useState } from "react";

import { v4 as uuidv4 } from 'uuid';
import { flatten } from "flat";

import { Collection } from "./domain/Collection";
import { Record } from "./domain/Record";
import { ISchema } from "./domain/Schema";


// anytime the collection changes, we want to update the records
export default function useCollections(collections: Collection[]): { [collectionKey: string]: { schema: ISchema, records: Record[] } }{
  // console.log('useCollection', collections)
  const [value, setValue] = useState({});
  // const [records, setRecords] = useState(collection.records);

  useEffect(() => {
    const values = {};
    const collectionCallbacks: { [collectionKey: string]: {collection: Collection, callback: Function} } = {} 

    collections.forEach(collection => {

      function callback(newRecords: Record[]) {
        // console.log('useRecord callback', field, newRecord)
        setValue({...value, [collection.key]: newRecords});
      }

      collectionCallbacks[collection.key] = { collection, callback };
      collection.subscribe('*', callback);

      values[collection.key] = { schema: collection.schema, records: collection.records };
    })

    setValue(values);

    return () => {
      Object.entries(collectionCallbacks).forEach(([field, collectionCallback]) => {
        collectionCallback.collection.unsubscribe('*', collectionCallback.callback);
      });
    };

  }, [JSON.stringify(Object.values(collections).map(collection => collection.key))]);

  return value;
}
