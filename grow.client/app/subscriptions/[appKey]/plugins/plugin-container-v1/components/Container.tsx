"use client";

import Grid from "@mui/material/Unstable_Grid2";
import { Box, Paper } from "@mui/material";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";

export default function PluginContainer({ components, width, margin, paper }) {
  // console.log("Rendering PluginContainer", width);

  const BoundingComponent: any = paper ? Paper : Box;

  return (
    <>
      <Grid xs={Number(width ?? 12)}>
        <BoundingComponent
          sx={{ boxSizing: "border-box", m: Number(margin ?? 0) }}
        >
          <ComponentsCollection components={components} />
        </BoundingComponent>
      </Grid>
    </>
  );
}
