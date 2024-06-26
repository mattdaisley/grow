"use client";

import { useEffect, useState } from "react";

import { v4 as uuidv4 } from 'uuid';
import { flatten } from "flat";

import { Collection } from "./domain/Collection";
import { Record } from "./domain/Record";
import { ISchema } from "./domain/ISchema";


// anytime the collection changes, we want to update the records
export default function useCollections(collections: Collection[]): IUseCollectionResponse {
  // console.log('useCollection', collections)
  const [value, setValue] = useState(undefined);
  // const [records, setRecords] = useState(collection.records);

  useEffect(() => {
    const values = {};
    const collectionCallbacks: ICollectionCallbacks = {} 

    collections.forEach(collection => {

      function callback(newRecords: Record[]) {
        // console.log('useCollections callback', collection, newRecords)
        setValue((prevValue) => ({...prevValue, [collection.key]: { schema: collection.schema, records: newRecords }}));
      }

      collectionCallbacks[collection.key] = { collection, callback };
      collection.subscribe('*', callback);

      values[collection.key] = { schema: collection.schema, records: collection.records };
    })

    setValue(values);

    return () => {
      // console.log('useCollection cleanup', collectionCallbacks);
      Object.entries(collectionCallbacks).forEach(([field, collectionCallback]) => {
        collectionCallback.collection.unsubscribe('*', collectionCallback.callback);
      });
    };

  }, [JSON.stringify(Object.values(collections).map(collection => collection.key))]);

  return value;
}

interface IUseCollectionResponse  { 
  [collectionKey: string]: { 
    schema: ISchema, 
    records: {[recordKey: string]: Record}
  } 
}

interface ICollectionCallbacks {
  [collectionKey: string]: {collection: Collection, callback: Function}
}