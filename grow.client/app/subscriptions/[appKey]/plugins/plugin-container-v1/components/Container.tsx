"use client";

import { useEffect, useRef } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Box, Paper } from "@mui/material";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";
import { Record } from "./../../../store/domain/Record";

export interface IPluginContainerProps {
  components: {
    record?: Record;
    value: {
      [pageKey: string]: Object;
    };
    rawValue: any;
    onChange: Function;
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
  // console.log("Rendering PluginContainer", components, padding, px, py);

  const BoundingComponent: any = paper ? Paper : Grid;

  const scrollableRef = useRef(null);

  useEffect(() => {
    if (!scrollableRef?.current) return;

    const handleScroll = (e) => {
      console.log(
        "Scrolled inside Container",
        e.target.scrollTop,
        e.target.scrollHeight,
        e.target.clientHeight
      );
    };

    const scrollableElement = scrollableRef.current;

    scrollableElement.addEventListener("scroll", handleScroll);

    return () => {
      scrollableElement.removeEventListener("scroll", handleScroll);
    };
  }, [scrollableRef?.current]);

  return (
    <>
      <Grid
        data-plugin="plugin-container-v1"
        data-record-key={components.record?.key}
        xs={12}
        sm={Number(width ?? 12)}
        sx={{ height: height ?? "auto", position: "relative" }}
      >
        <BoundingComponent
          ref={scrollableRef}
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
          })}
        >
          <Grid
            container
            direction={"row"}
            spacing={0}
            sx={(theme) => ({
              height: height ?? "auto",
              position: "relative",
              overflowY: "auto",
            })}
          >
            <ComponentsCollection components={components.value} />
          </Grid>
        </BoundingComponent>
      </Grid>
    </>
  );
}
