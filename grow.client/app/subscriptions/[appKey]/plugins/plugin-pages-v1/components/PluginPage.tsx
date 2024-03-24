"use client";

import useRecords from "../../../store/useRecords";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";

export function PluginPage({ pageRecord }) {
  const { components } = useRecords([
    { record: pageRecord, field: "components" },
  ]);

  // console.log("PluginPage", pageRecord, components);

  if (!components) {
    return null;
  }

  return (
    <>
      <PageHeader pageRecord={pageRecord} />
      <ComponentsCollection components={components.value} />
    </>
  );
}

function PageHeader({ pageRecord }) {
  const { display_name, path } = useRecords([
    { record: pageRecord, field: "display_name" },
    { record: pageRecord, field: "path" },
  ]);

  // console.log("PluginPage PageHeader", pageRecord, display_name, path);

  if (!display_name || !path) {
    return null;
  }

  return (
    <>
      <div>{display_name.value}</div>
      <div>{path.value}</div>
    </>
  );
}
