"use client";

import { Box } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import useRecords from "../../../store/useRecords";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";

export function PluginPage({ pageRecord, filter }) {
  const { components, path, height } = useRecords({
    components: { record: pageRecord },
    path: { record: pageRecord },
    height: { record: pageRecord },
  });

  // console.log("PluginPage", pageRecord, filter, components, path, height);
  if (filter !== undefined && path.value !== "/" + filter[0]) {
    return null;
  }

  if (components.value === undefined) {
    return null;
  }

  return (
    <>
      {/* <PageHeader pageRecord={pageRecord} /> */}
      <Grid container sx={{ height: height.value ?? 1 }}>
        <ComponentsCollection components={components.value} />
      </Grid>
    </>
  );
}

function PageHeader({ pageRecord }) {
  const { display_name } = useRecords({
    display_name: { record: pageRecord },
  });

  // console.log("PluginPage PageHeader", pageRecord, display_name, path);

  if (display_name.value === undefined) {
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
