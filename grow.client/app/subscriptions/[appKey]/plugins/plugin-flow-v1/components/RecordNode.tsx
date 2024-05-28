"use client";

import { useEffect, useRef } from "react";
import { Handle, Position, NodePositionChange } from "reactflow";
import { Paper } from "@mui/material";

import useRecords from "../../../store/useRecords";

const handleCallbackChange = (recordCallbackRef, newRecordValue, onChange) => {
  // console.log("handleCallbackChange", recordCallbackRef.current, newRecordValue)
  const change: NodePositionChange = {
    id: undefined,
    type: "position",
    dragging: true,
    positionAbsolute: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
  };
  Object.entries(newRecordValue).forEach(([key, value]: [string, any]) => {
    change.id = key;
    change.position.x = value.x.value;
    change.position.y = value.y.value;
  });

  if (recordCallbackRef.current.xPos === change.position.x &&
    recordCallbackRef.current.yPos === change.position.y) {
    return;
  }

  recordCallbackRef.current.xPos = change.position.x;
  recordCallbackRef.current.yPos = change.position.y;
  // console.log("handleCallbackChange", change, recordCallbackRef.current);
  onChange && onChange(change);
};

export function RecordNode({
  data,
  dragging,
  onChange,
  selected,
  xPos,
  yPos,
  ...props
}) {
  // console.log("RecordNode", dragging, selected, xPos, yPos, props);
  const recordCallbackRef = useRef({
    xPos,
    yPos,
    onChange: undefined,
  });

  const useRecordsResult = useRecords({
    label: { record: data.record },
    x: {
      record: data.record,
      callback: (newRecordValue) =>
        handleCallbackChange(recordCallbackRef, newRecordValue, onChange),
    },
    y: {
      record: data.record,
      callback: (newRecordValue) =>
        handleCallbackChange(recordCallbackRef, newRecordValue, onChange),
    },
  });

  const currentRecordX = useRecordsResult?.x?.value;
  const currentRecordY = useRecordsResult?.y?.value;
  // console.log("RecordNode", useRecordsResult?.label?.value, currentRecordX, currentRecordY);
  useEffect(() => {
    // console.log("RecordNode useEffect xPos", recordCallbackRef.current.xPos, xPos, dragging)
    if (recordCallbackRef.current.xPos === xPos) {
      return;
    }

    recordCallbackRef.current.xPos = xPos;
    if (dragging) {
      useRecordsResult?.x?.onChange && useRecordsResult?.x?.onChange(xPos);
    }
  }, [currentRecordX, recordCallbackRef.current.xPos, xPos]);

  useEffect(() => {
    // console.log("RecordNode useEffect yPos", recordCallbackRef.current.yPos, yPos, dragging)
    if (recordCallbackRef.current.yPos === yPos) {
      return;
    }

    recordCallbackRef.current.yPos = yPos;
    if (dragging) {
      useRecordsResult?.y?.onChange && useRecordsResult?.y?.onChange(yPos);
    }
  }, [currentRecordY, recordCallbackRef.current.yPos, yPos]);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Paper
        sx={(theme) => ({
          py: 1,
          px: 2,
          bgcolor: selected
            ? theme.palette.primary.light
            : theme.palette.background.default,
          color: selected
            ? theme.palette.text.primary
            : theme.palette.primary.contrastText,
        })}
      >
        {useRecordsResult?.label?.value ?? ""}
      </Paper>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
