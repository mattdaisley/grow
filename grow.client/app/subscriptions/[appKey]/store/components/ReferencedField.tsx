"use client";
import useRecord from "../useRecord";
import useCollection from "../useCollection";
import { Collection } from "../domain/Collection";
import { Plugin } from "../domain/Plugin";
import { RecordPluginComponent } from "./RecordPluginComponent";

interface IReferencedFieldProps {
  plugin: Plugin;
  collection: Collection;
  recordKey: string;
  fieldKey: string;
  fieldPropKey: string;

  [props: string]: any;
}
export function ReferencedField({
  plugin,
  collection,
  recordKey,
  fieldKey,
  fieldPropKey,
  ...props
}: IReferencedFieldProps) {
  const records = useCollection(collection);
  const record = records[recordKey];
  const fieldName = record.schema.fields[fieldKey].name;
  const [field, onChange] = useRecord(record, fieldName);

  const componentProps = {
    [fieldPropKey]: field,
    onChange,
    ...props,
  };

  return (
    <>
      <RecordPluginComponent plugin={plugin} {...componentProps} />
    </>
  );
}
