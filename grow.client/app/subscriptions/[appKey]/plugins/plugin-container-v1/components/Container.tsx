"use client";

import Grid from "@mui/material/Unstable_Grid2";
import { Box, Paper } from "@mui/material";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";

export interface IPluginContainerProps {
  components: {
    [pageKey: string]: Object;
  };
  width?: string;
  height?: string;
  margin?: string;
  mx?: string;
  my?: string;
  padding?: string;
  px?: string;
  py?: string;
  border?: string;
  paper?: boolean;
}
export default function PluginContainer({
  components,
  width,
  height,
  margin,
  mx,
  my,
  padding,
  px,
  py,
  border,
  paper,
}: IPluginContainerProps) {
  // console.log("Rendering PluginContainer", padding, px, py);

  const BoundingComponent: any = paper ? Paper : Box;

  return (
    <>
      <Grid
        xs={12}
        sm={Number(width ?? 12)}
        sx={{ height: height ?? "auto", position: "relative" }}
      >
        <BoundingComponent
          sx={(theme) => ({
            position: "relative",
            boxSizing: "border-box",
            margin: margin ? Number(margin ?? 0) : undefined,
            mx: mx ? Number(mx ?? 0) : undefined,
            my: my ? Number(my ?? 0) : undefined,
            padding: padding ? Number(padding ?? 0) : undefined,
            px: px ? Number(px ?? 0) : undefined,
            py: py ? Number(py ?? 0) : undefined,
            border,
            height: `calc(100% - ${theme.spacing(
              Number(margin ?? 0)
            )} - ${theme.spacing(Number(margin ?? 0))})`,
            overflowY: "auto",
          })}
        >
          <ComponentsCollection components={components} />
        </BoundingComponent>
      </Grid>
    </>
  );
}
