"use client";

import { useEffect, useState } from "react";

import { v4 as uuidv4 } from 'uuid';
import { flatten } from "flat";

import { Collection } from "./domain/Collection";


export default function useCollection(collection: Collection) {
  console.log('useCollection', collection)
  const [value, setValue] = useState(collection);

  return value.records;
}
