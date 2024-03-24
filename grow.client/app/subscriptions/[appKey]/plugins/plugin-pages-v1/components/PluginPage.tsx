"use client";

import useRecords from "../../../store/useRecords";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";

export function PluginPage({ pageRecord }) {
  // const { display_name, path, components } = useRecords(pageRecord, [
  //   "display_name",
  //   "path",
  //   "components",
  // ]);

  const { display_name, path, components } = useRecords([
    { record: pageRecord, field: "display_name" },
    { record: pageRecord, field: "path" },
    { record: pageRecord, field: "components" },
  ]);

  // console.log("PluginPage", pageRecord, display_name, path, components);

  if (!display_name || !path || !components) {
    return null;
  }

  return (
    <>
      <div>{display_name.value}</div>
      <div>{path.value}</div>
      <ComponentsCollection components={components.value} />
    </>
  );
}
