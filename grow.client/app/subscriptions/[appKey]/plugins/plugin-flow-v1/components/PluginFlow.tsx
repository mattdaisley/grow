"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  MiniMap,
  Position,
  SelectionMode,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useNodesState,
  useEdgesState,
  NodePositionChange,
} from "reactflow";

import "reactflow/dist/style.css";
import { Collection } from "../../../store/domain/Collection";
import useCollections from "../../../store/useCollections";
import { Paper } from "@mui/material";
import useRecords from "../../../store/useRecords";

interface IPluginFlowProps {
  nodesCollection: Collection,
  edgesCollection: Collection,
}

export default function PluginFlow({
  nodesCollection,
  edgesCollection,
  ...props
}: IPluginFlowProps) {
  const useCollectionsResponse = useCollections([nodesCollection, edgesCollection]);
  // console.log("PluginFlow useCollectionsResponse", useCollectionsResponse);
  if (!useCollectionsResponse) {
    return null;
  }

  const nodeRecords = useCollectionsResponse[nodesCollection.key]?.records;
  const edgeRecords = useCollectionsResponse[edgesCollection.key]?.records;
  // console.log("PluginFlow nodeRecords and edgeRecords", nodeRecords, edgeRecords);

  const nodes = Object.entries(nodeRecords).map(([key, nodeRecord]) => {
    const { x, y, label } = (nodeRecord.value as any);

    return {
      id: key,
      type: "recordNode",
      position: { x, y },
      data: { record: nodeRecord, label },
    };
  });

  const edges = Object.entries(edgeRecords).map(([key, edgeRecord]) => {
    const { source, target } = (edgeRecord.value as any);

    return {
      id: key,
      source,
      target,
    };
  });

  // console.log('PluginFlow nodes and edges', nodes, edges)
  const handleEdgeConnected = (newEdge) => {
    // console.log("handleEdgeConnected", newEdge);

    const contents = {};
    if (edgesCollection?.schema !== undefined) {
      const target_field_key = Object.keys(edgesCollection.schema.fields).find((key) => edgesCollection.schema.fields[key].name === "target");
      const source_field_key = Object.keys(edgesCollection.schema.fields).find((key) => edgesCollection.schema.fields[key].name === "source");

      contents[target_field_key] = newEdge.target;
      contents[source_field_key] = newEdge.source;
    }

    // console.log("handleEdgeConnected", contents);

    edgesCollection.createRecord(contents);
  };

  return (
    <>
      <FlowDiagram
        initialNodes={nodes}
        initialEdges={edges}
        onEdgeConnected={handleEdgeConnected}
      />
    </>
  );
}

function FlowDiagram({ initialNodes, initialEdges, onEdgeConnected }) {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // console.log('FlowDiagram nodes and edges', nodes, edges)

  const handleNodesChange = useCallback(
    (changes) => {
      // console.log("onNodesChange", changes[0])
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes) => setEdges((eds) => {
      console.log('handleEdgesChange', changes)
      return applyEdgeChanges(changes, eds);
    }),
    [setEdges, onEdgeConnected]
  );

  const onConnect = useCallback(
    (params) =>
        onEdgeConnected && onEdgeConnected({ ...params }),
      // setEdges((eds) => {
      //   console.log("onConnect", params);
      //   onEdgeConnected && onEdgeConnected({ ...params });
      //   return addEdge(params, eds);
      // }),
    [setEdges, onEdgeConnected]
  );

  useEffect(() => {
    setNodes((nds) => {
      const merged = [
        ...(nds as Array<any>)
          .concat(initialNodes)
          .reduce(
            (m, o) => m.set(o.id, Object.assign(m.get(o.id) || {}, o)),
            new Map()
          )
          .values(),
      ];

      return merged;
    });
  }, [
    JSON.stringify(
      initialNodes.map((n) => {
        n.id, n.data.label;
      })
    ),
  ]);

  useEffect(() => {
    setEdges((eds) => {
      const merged = [
        ...(eds as Array<any>)
          .concat(initialEdges)
          .reduce(
            (m, o) => m.set(o.id, Object.assign(m.get(o.id) || {}, o)),
            new Map()
          )
          .values(),
      ];
      // console.log("useEffect initialEdges", initialEdges, eds, merged);

      return merged;
    });
  }, [JSON.stringify(initialEdges)]);

  function recordNodeChange(change) {
    setNodes((nds) => applyNodeChanges([change], nds));
    // console.log("recordNodeChange", change);
  }

  const nodeTypes = useMemo(
    () => ({
      recordNode: (props) => (
        <RecordNode onChange={recordNodeChange} {...props} />
      ),
    }),
    []
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        // panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode={SelectionMode.Partial}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

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

  if (
    recordCallbackRef.current.xPos === change.position.x &&
    recordCallbackRef.current.yPos === change.position.y
  ) {
    return;
  }

  recordCallbackRef.current.xPos = change.position.x;
  recordCallbackRef.current.yPos = change.position.y;
  // console.log("handleCallbackChange", change, recordCallbackRef.current);

  onChange && onChange(change);
};

function RecordNode({ data, dragging, xPos, yPos, onChange }) {
  // console.log("RecordNode", data, onChange);

  const recordCallbackRef = useRef({
    xPos,
    yPos,
    onChange: undefined
  });

  const useRecordsResult = useRecords({
    label: { record: data.record },
    x: {
      record: data.record,
      callback: (newRecordValue) => handleCallbackChange(recordCallbackRef, newRecordValue, onChange),
    },
    y: {
      record: data.record,
      callback: (newRecordValue) => handleCallbackChange(recordCallbackRef, newRecordValue, onChange),
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
      <Paper sx={{ py: 1, px: 2 }}>
        {useRecordsResult?.label?.value ?? ''}
      </Paper>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}


// const initialNodes = [
//   { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
//   { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
// ];
// const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];