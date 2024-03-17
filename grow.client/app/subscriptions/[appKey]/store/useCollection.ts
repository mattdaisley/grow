"use client";

import { useEffect, useState } from "react";

import { v4 as uuidv4 } from 'uuid';
import { flatten } from "flat";

import { Collection } from "./domain/Collection";


// anytime the collection changes, we want to update the records
export default function useCollection(collection: Collection) {
  // console.log('useCollection', collection)
  const [records, setRecords] = useState(collection.records);

  useEffect(() => {
    function callback(newRecords) {
      // console.log('useCollection callback', newRecords === records)
      setRecords(newRecords);
    }

    collection.subscribe('*', callback);

    return () => {
      collection.unsubscribe('*', callback);
    };

  }, [collection]);

  return records;
}
