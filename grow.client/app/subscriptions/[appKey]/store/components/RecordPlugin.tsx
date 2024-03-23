"use client";

import useRecord from "../useRecord";

import { RecordPluginComponent } from "./RecordPluginComponent";
import { ReferencedField } from "./ReferencedField";

export function RecordPlugin({ record }) {
  const [pluginKey] = useRecord(record, "plugin_key");

  const [value] = useRecord(record, "value");
  const [label] = useRecord(record, "label");
  console.log(
    "RecordPlugin pluginKey",
    pluginKey,
    "value",
    value,
    "label",
    label
  );

  const plugin = record.app.plugins[pluginKey];
  console.log(plugin.properties);

  if (typeof value === "string" && value.startsWith("collections.")) {
    const regex =
      /collections\.([a-zA-Z0-9-_]+)\.records\.([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]+)/;
    // eg. "collections.1_1.records.r_1_1_0.f_1_1_0"
    const matches = value.match(regex);
    if (matches) {
      console.log("regex matches", matches); // Outputs: my-collection
      const collectionKey = matches[1];
      const recordKey = matches[2];
      const fieldKey = matches[3];

      const collection = record.app.collections[collectionKey];
      return (
        <ReferencedField
          plugin={plugin}
          collection={collection}
          recordKey={recordKey}
          fieldKey={fieldKey}
          fieldPropKey="value"
          {...{ label }}
        />
      );
    }
  }
  return <RecordPluginComponent plugin={plugin} value={value} lable={label} />;
}
