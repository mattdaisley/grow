"use client";

import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  SelectionMode, applyEdgeChanges,
  applyNodeChanges,
  useNodesState,
  useEdgesState,
} from "reactflow";

import "reactflow/dist/style.css";

import { RecordNode } from "./RecordNode";
import { FlowPanel } from "./FlowPanel";
import { ViewportCollectionUpdater } from "./ViewportCollectionUpdater";


export function FlowDiagram({ initialNodes, initialEdges, viewportCollection, panelCollection, onEdgeConnected }) {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // console.log(
  //   "FlowDiagram nodes and edges",
  //   nodes,
  //   edges,
  //   viewportCollection,
  //   panelCollection
  // );
  const handleNodesChange = useCallback(
    (changes) => {
      // console.log("onNodesChange", changes[0])
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes) => setEdges((eds) => {
      console.log('handleEdgesChange', changes);
      return applyEdgeChanges(changes, eds);
    }),
    [setEdges, onEdgeConnected]
  );

  const onConnect = useCallback(
    (params) => onEdgeConnected && onEdgeConnected({ ...params }),
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
        fitView={true}
      >
        {panelCollection && <FlowPanel panelCollection={panelCollection} />}
        {viewportCollection && (
          <ViewportCollectionUpdater
            addNodeSourceCollection={viewportCollection}
          />
        )}
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

