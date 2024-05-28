"use client";

import { useEffect } from "react";
import {
  useViewport,
  useReactFlow
} from "reactflow";

import useCollections from "../../../store/useCollections";
import useRecords from "../../../store/useRecords";
import useAppState from "../../../store/useAppState";

export function ViewportCollectionUpdater({ addNodeSourceCollection }) {
  // console.log('ViewportChangeLogger', addNodeSourceCollection)

  const useCollectionsResponse = useCollections([
    addNodeSourceCollection
  ]);

  // console.log("ViewportChangeLogger useCollectionsResponse", useCollectionsResponse);
  if (!useCollectionsResponse) {
    return null;
  }

  const records = useCollectionsResponse[addNodeSourceCollection.key].records;

  if (!records || Object.keys(records).length === 0) {
    return null;
  }

  const firstKey = Object.keys(records)[0];

  return <ViewPortRecordUpdator record={records[firstKey]} />;
}
function ViewPortRecordUpdator({ record }) {

  const { x, y, zoom } = useRecords({
    x: { record },
    y: { record },
    zoom: { record },
  });

  const { appBarHeight } = useAppState("appBarHeight");
  const { drawerWidth } = useAppState("drawerWidth");

  const viewport = useViewport();
  const reactFlow = useReactFlow();

  useEffect(() => {
    const { x: flowX, y: flowY } = reactFlow.screenToFlowPosition({
      x: (drawerWidth.value ?? 0) + 100,
      y: (appBarHeight.value ?? 0) + 100,
    });
    x.onChange && x.onChange(flowX);
    y.onChange && y.onChange(flowY);
    zoom.onChange && zoom.onChange(viewport.zoom);
  }, [reactFlow, viewport.x, viewport.y, viewport.zoom]);

  return null;
}
