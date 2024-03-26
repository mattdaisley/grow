"use client";

import useRecords from "../../../store/useRecords";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";
import { Box } from "@mui/material";

export function PluginPage({ pageRecord, filter }) {
  const { components, path } = useRecords({
    components: { record: pageRecord },
    path: { record: pageRecord },
  });

  // console.log("PluginPage", pageRecord, components, path, filter);
  if (filter !== undefined && path?.value !== "/" + filter[0]) {
    return null;
  }

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
  const { display_name } = useRecords({
    display_name: { record: pageRecord, field: "display_name" },
  });

  // console.log("PluginPage PageHeader", pageRecord, display_name, path);

  if (!display_name) {
    return null;
  }

  return (
    <>
      <Box sx={{ pl: 2, pr: 2 }}>
        <h2>{display_name.value}</h2>
      </Box>
    </>
  );
}
