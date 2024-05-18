"use client";

import { useEffect, useState } from "react";

import { flatten } from "flat";

import { Record } from './domain/Record';

export interface RecordsFieldRequest {
  [key: string]: {
    record: Record;
    field?: string;
  }
}
export interface useRecordsResult {
  [valueKey: string]: { 
    record?: Record,
    value: any, 
    rawValue: any,
    bracketValues: any,
    onChange: Function 
  }
}
interface callbacksCache {
  [valueKey: string]: { 
    record: Record, 
    fieldName: string, 
    callback: Function 
  } 
}

/**
 *  A collection consists of a schema and a set of records. 
 *  The schema defines the fields that each record has. 
 *  Records are objects with properties that map to the field id in the schema.
 *
 * @param {Record} record - The record to subscribe to.
 * @param {string[]} fields - The fields in the record to subscribe to. E.g. "display_name"
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

  const initialResult = {}
  Object.keys(recordFieldRequests).forEach((key) => {
    initialResult[key] = { value: undefined, onChange: undefined };
  });

  const [value, setValue] = useState<useRecordsResult>(initialResult);

  useEffect(() => {
    // console.log('useRecord useEffect', recordFieldRequests)
    if (!recordFieldRequests) return;

    const values: useRecordsResult = {};
    const callbacks: callbacksCache = {} 

    Object.entries(recordFieldRequests).forEach(([key, recordFieldRequest]) => {

      const {record, field} = recordFieldRequest;

      const fieldName = getFieldName(key, field, record);
      // console.log('useRecord fieldName', fieldName, key, field, record)

      callbacks[key] = { record: record, fieldName, callback: getCallback(key, fieldName, setValue) };
      record.subscribe(fieldName, callbacks[key].callback);

      values[key] = {
        record,
        value: record.value[fieldName],
        rawValue: record.rawValue[fieldName],
        bracketValues: record.bracketValues[fieldName],
        onChange: getOnChangeHandler(record, fieldName),
      };
    })

    setValue(values);

    // console.log('useRecord callbacks', callbacks)

    return () => {
      Object.entries(callbacks).forEach(([key, recordCallback]) => {
        // console.log('useRecord cleanup', recordCallback.fieldName)
        recordCallback.record.unsubscribe(recordCallback.fieldName, recordCallback.callback);
      });
    };

  }, [JSON.stringify(Object.entries(recordFieldRequests).map(([key, recordFieldRequest]) => key + recordFieldRequest.record.key + recordFieldRequest.field))]);

  return value;
}

function getFieldName(key: string, field: string, record: Record): string {
  // console.log('useRecord getFieldName', key, field, record)
  let fieldName = key;

  if (field) {
    fieldName = field;
  }

  if (typeof fieldName === "string" && fieldName.startsWith("schema.fields.")) {
    // console.log('useRecord getFieldName', fieldName, record)
    const fieldKey = fieldName.split(".")[2];
    fieldName = record.schema.fields[fieldKey].name;
  }

  return fieldName;
}

function getCallback(key: string, fieldName: string, setValue: Function): Function {

  return function callback(newRecord: Record) {
    setValue((currentValue: useRecordsResult) => {
      // console.log(
      //   "useRecord callback",
      //   currentValue,
      //   key,
      //   fieldName,
      //   newRecord
      // );
      return {
        ...currentValue,
        [key]: {
          record: newRecord,
          value: newRecord.value[fieldName],
          rawValue: newRecord.rawValue[fieldName],
          bracketValues: newRecord.bracketValues[fieldName],
          onChange: currentValue[key].onChange,
        },
      };
    });
    // setValue({...value, [field]: newRecord.value[field]});
  }
}

function getOnChangeHandler(record: Record, field: string): Function {
  return function onChange(newValue: any) {
    // console.log('useRecord onChange', record, field, newValue)
    record.updateField(field, newValue);
  }
}