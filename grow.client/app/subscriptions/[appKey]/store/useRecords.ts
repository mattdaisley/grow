"use client";

import { useEffect, useState } from "react";

import { flatten } from "flat";

import { Record } from './domain/Record';

interface RecordsFieldRequest {
  record: Record;
  field: string;
}
interface useRecordsResult {
  [valueKey: string]: { 
    value: any, 
    onChange: Function 
  }
}
interface callbacksCache {
  [valueKey: string]: { 
    record: Record, 
    field: string, 
    callback: Function 
  } 
}

/**
 *  A collection consists of a schema and a set of records. 
 *  The schema defines the fields that each record has. 
 *  Records are objects with properties that map to the field id in the schema.
 *
 * @param {Record} record - The record to subscribe to.
 * @param {string[]} fields - The field in the record to subscribe to. E.g. "display_name"
 * @returns {any} The value of the field in the record. E.g. "Display Name"
 * @example
 *   fields: {
 *     "id-field": {
 *       type: "string",
 *       name: "display_name"
 *     }
 *   }
 *   records: {
 *     "id-record": {
 *       ["id-field"]: "Display Name"
 *     }
 *   }
 */
export default function useRecords(recordFieldRequests: RecordsFieldRequest[]): useRecordsResult {

  const [value, setValue] = useState<useRecordsResult>({});

  useEffect(() => {
    // console.log('useRecord useEffect', recordFieldRequests)
    if (!recordFieldRequests) return;

    const values: useRecordsResult = {};
    const callbacks: callbacksCache = {} 

    recordFieldRequests.forEach(recordFieldRequest => {

      const record = recordFieldRequest.record;
      const field = recordFieldRequest.field;

      function callback(newRecord: Record) {
        // console.log('useRecord callback', field, newRecord)
        setValue((currentValue) => ({...currentValue, [field]: { ...currentValue[field], value: newRecord.value[field]}}));
        // setValue({...value, [field]: newRecord.value[field]});
      }

      callbacks[field] = { record: record, field, callback };
      record.subscribe(field, callback);

      function onChange (newValue: any) {
        // console.log('useRecord onChange', record, field, newValue)
        record.updateField(field, newValue);
      }

      values[field] = { value: record.value[field], onChange};
    })

    setValue(values);

    // console.log('useRecord callbacks', callbacks)

    return () => {
      // console.log('useRecord cleanup')
      Object.entries(callbacks).forEach(([field, recordCallback]) => {
        recordCallback.record.unsubscribe(recordCallback.field, recordCallback.callback);
      });
    };

  }, [JSON.stringify(recordFieldRequests.map(recordFieldRequest => recordFieldRequest.record.key + recordFieldRequest.field))]);

  return value;
}
