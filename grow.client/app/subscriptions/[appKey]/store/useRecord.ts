"use client";

import { useEffect, useState } from "react";

import { flatten } from "flat";

import { Record } from './domain/Record';

/**
 *  A collection consists of a schema and a set of records. 
 *  The schema defines the fields that each record has. 
 *  Records are objects with properties that map to the field id in the schema.
 *
 * @param {Record} record - The record to subscribe to.
 * @param {string} field - The field in the record to subscribe to. E.g. "display_name"
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
export default function useRecord(record: Record, field: string): any {
  // console.log('userRecord', record, field)
  const [value, setValue] = useState(record.value[field]);

  useEffect(() => {
    function callback(newRecord: Record) {
      // console.log('useRecord callback', field, newRecord)
      setValue(newRecord.value[field]);
    }

    record.subscribe(field, callback);

    return () => {
      record.unsubscribe(field, callback);
    };

  }, [record, field]);

  const onChange = (newValue: any) => {
    record.updateField(field, newValue);
  }

  return [value, onChange];
}
