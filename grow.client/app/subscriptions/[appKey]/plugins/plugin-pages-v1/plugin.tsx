"use client";

import { useEffect, useState } from "react";
import { Collection, getCollection } from "../../store/getCollection";
import { PagesNavDrawer } from "./components/PagesNavDrawer";
import PagesAppBar from "./components/PagesAppBar";

export default function Plugin({ app, pluginKey, ...props}) {

  const [collection, setCollection] = useState<Collection>();

  useEffect(() => {
    async function fetchCollection() {
      const collection = await getCollection(app, pluginKey);  
      console.log(collection);
      setCollection(collection);
    }

    fetchCollection();
  }, []);

  if (collection === undefined) {
    return null;
  }

  const pages = {}
  
  Object.keys(collection.records).forEach((recordKey) => {
    const record = collection.records[recordKey];

    const fields = Object.keys(record).map((fieldKey) => {
      console.log(fieldKey, collection.schema.fields);
      const name = collection.schema.fields[fieldKey].name;
      return {
        [name]: record[fieldKey],
      };
    });

    pages[recordKey] = fields[0];
  });

  return (
    <>
      <PagesAppBar pages={pages} user={"test"} />
      <PagesNavDrawer pages={pages} appKey={"test"} />
    </>
  );
}