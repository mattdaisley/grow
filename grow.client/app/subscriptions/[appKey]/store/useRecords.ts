"use client";

import { useEffect, useState } from "react";

import { flatten } from "flat";

import { Record } from './domain/Record';

export interface RecordsFieldRequest {
  [key: string]: {
    record: Record;
    field?: string;
    callback?: Function;
  }
}
export interface useRecordsResult {
  [key: string]: {
    field: Field;
    record?: Record;
    value: any;
    displayValue: any;
    rawValue: any;
    bracketValues: any;
    onChange: Function;
  };
}
interface callbacksCache {
  [key: string]: { 
    record: Record, 
    field: Field, 
    callback: Function 
  } 
}
interface Field {
  key: string;
  name: string;
  type: string;
}

/**
 *  A collection consists of a schema and a set of records. 
 *  The schema defines the fields that each record has. 
 *  Records are objects with properties that map to the field id in the schema.
 *
 * @param {RecordsFieldRequest} recordsFieldRequest - The record to subscribe to.
 * @returns {useRecordsResult} The value of the field in the record. E.g. "Display Name"
 * @example
 *   recordsFieldRequest: {
 *     "field_name": {
 *       record: Record,
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

    Object.entries(recordFieldRequests).forEach(([requestKey, recordFieldRequest]) => {
      if (!recordFieldRequest?.record) return;

      const {record, field: requestField, callback: requestCallback} = recordFieldRequest;

      const field = getField(requestKey, requestField, record);
      // console.log('useRecord fieldName', fieldName, key, field, record)

      callbacks[requestKey] = { record: record, field, callback: getCallback(requestKey, field.name, setValue, requestCallback) };
      record.subscribe(field.name, callbacks[requestKey].callback);

      values[requestKey] = {
        record,
        field,
        value: record.valueByFieldName(field.name),
        displayValue: record.getDisplayValueByFieldName(field.name),
        rawValue: record.rawValue[field.name],
        bracketValues: record.bracketValueByFieldName(field.name),
        onChange: getOnChangeHandler(record, field.name),
      };
    })

    setValue(values);

    // console.log('useRecord callbacks', callbacks)

    return () => {
      Object.entries(callbacks).forEach(([key, recordCallback]) => {
        // console.log('useRecord cleanup', recordCallback.fieldName)
        recordCallback.record.unsubscribe(recordCallback.field.name, recordCallback.callback);
      });
    };

  }, [JSON.stringify(Object.entries(recordFieldRequests).map(([key, recordFieldRequest]) => key + recordFieldRequest?.record?.key + recordFieldRequest.field))]);

  return value;
}

function getField(key: string, field: string, record: Record): Field {
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

  const matchingFields = Object.entries(record.schema.fields)
    .map(([key, value]) => ({key, value}))
    .filter(kv => kv.value.name === fieldName);

  if (matchingFields.length === 0) {
    return {
      key: '',
      name: fieldName,
      type: '',
    }
  }

  return {
    key: matchingFields[0].key,
    name: matchingFields[0].value.name,
    type: matchingFields[0].value.type,
  };
}

function getCallback(key: string, fieldName: string, setValue: Function, requestCallback?: Function): Function {
  // console.log('useRecord getCallback', key, fieldName, setValue)
  return function callback(newRecord: Record) {
    setValue((currentValue: useRecordsResult) => {
      // console.log(
      //   "useRecord callback",
      //   currentValue,
      //   key,
      //   fieldName,
      //   newRecord
      // );

      const newRecordValue = {
        record: newRecord,
        value: newRecord.valueByFieldName(fieldName),
        displayValue: newRecord.getDisplayValueByFieldName(fieldName),
        rawValue: newRecord.rawValue[fieldName],
        bracketValues: newRecord.bracketValueByFieldName(fieldName),
        onChange: currentValue[key].onChange,
      }

      const newValue = {
        ...currentValue,
        [key]: newRecordValue,
      };

      requestCallback && requestCallback({ [newRecord.key]: newValue });

      return newValue;

    });
    // setValue({...value, [field]: newRecord.value[field]});
  }
}

function getOnChangeHandler(record: Record, field: string): Function {
  return function onChange(newValue: any) {
    // console.log("useRecord onChange", record, field, newValue);
    record.updateField(field, newValue);
  }
}