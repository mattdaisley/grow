"use client";
import useCollection from "../useCollection";
import { RecordPlugin } from "./RecordPlugin";

export function ComponentsCollection({ components }) {
  const componentRecords = useCollection(components);

  return (
    <>
      {Object.entries(componentRecords).map(([key, componentRecord]) => {
        return <RecordPlugin key={key} record={componentRecord} />;
      })}
    </>
  );
}
