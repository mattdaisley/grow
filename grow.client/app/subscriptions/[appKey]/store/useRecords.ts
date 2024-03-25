"use client";

import { useEffect, useState } from "react";

import { flatten } from "flat";

import { Record } from './domain/Record';

interface RecordsFieldRequest {
  [key: string]: {
    record: Record;
    field?: string;
  }
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
export default function useRecords(recordFieldRequests: RecordsFieldRequest): useRecordsResult {

  const [value, setValue] = useState<useRecordsResult>({});

  useEffect(() => {
    // console.log('useRecord useEffect', recordFieldRequests)
    if (!recordFieldRequests) return;

    const values: useRecordsResult = {};
    const callbacks: callbacksCache = {} 

    Object.entries(recordFieldRequests).forEach(([key, recordFieldRequest]) => {

      const record = recordFieldRequest.record;
      let field = recordFieldRequest.field;
      if (!field) {
        field = key;
      }
      if (typeof field === "string" && field.startsWith("schema.fields.")) {
        const fieldKey = field.split(".")[2];
        field = record.schema.fields[fieldKey].name;
      }

      function callback(newRecord: Record) {
        // console.log('useRecord callback', field, newRecord)
        setValue((currentValue) => ({...currentValue, [key]: { ...currentValue[key], value: newRecord.value[field]}}));
        // setValue({...value, [field]: newRecord.value[field]});
      }

      callbacks[key] = { record: record, field, callback };
      record.subscribe(field, callback);

      function onChange (newValue: any) {
        // console.log('useRecord onChange', record, field, newValue)
        record.updateField(field, newValue);
      }

      values[key] = { value: record.value[field], onChange};
    })

    setValue(values);

    // console.log('useRecord callbacks', callbacks)

    return () => {
      // console.log('useRecord cleanup')
      Object.entries(callbacks).forEach(([key, recordCallback]) => {
        recordCallback.record.unsubscribe(recordCallback.field, recordCallback.callback);
      });
    };

  }, [JSON.stringify(Object.entries(recordFieldRequests).map(([key, recordFieldRequest]) => key + recordFieldRequest.record.key + recordFieldRequest.field))]);

  return value;
}
