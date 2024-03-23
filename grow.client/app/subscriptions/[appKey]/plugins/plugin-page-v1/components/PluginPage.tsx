"use client";

import useRecord from "../../../store/useRecord";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";

export function PluginPage({ page }) {
  const [displayName] = useRecord(page, "display_name");
  const [path] = useRecord(page, "path");
  const [components] = useRecord(page, "components");

  return (
    <>
      <div>{displayName}</div>
      <div>{path}</div>
      <ComponentsCollection components={components} />
    </>
  );
}
