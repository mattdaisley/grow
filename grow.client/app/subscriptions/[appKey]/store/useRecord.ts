"use client";

import { useEffect, useState } from "react";

import { flatten } from "flat";

import { Record } from './domain/Record';

export default function useRecord(record: Record, field: string) {
  // console.log('userRecord', record, field)
  const [value, setValue] = useState(record.value[field]);

  return value;
}
