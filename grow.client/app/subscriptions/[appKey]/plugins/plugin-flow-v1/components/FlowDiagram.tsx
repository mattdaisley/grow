"use client";

import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeChange,
  MiniMap,
  NodeChange,
  NodeProps,
  SelectionMode, applyEdgeChanges,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/style.css";

import { RecordNode } from "./RecordNode";
import { FlowPanel } from "./FlowPanel";
import { ViewportCollectionUpdater } from "./ViewportCollectionUpdater";


export function FlowDiagram({
  initialEdges,
  initialNodes,
  onEdgeConnected,
  onEdgeRemoved,
  onNodeRemoved,
  panelCollection,
  viewportCollection,
}) {
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
    (changes: NodeChange[]) => {
      // console.log("onNodesChange", changes[0]);
      changes.forEach((change) => {
        if (change.type === "remove") {
          // console.log("remove node", change.id);
          onNodeRemoved && onNodeRemoved(change.id);
        }
      });
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => {
        // console.log("handleEdgesChange", changes);
        changes.forEach((change) => {
          if (change.type === "remove") {
            // console.log("remove edge", change.id);
            onEdgeRemoved && onEdgeRemoved(change.id);
          }
        });

        return applyEdgeChanges(changes, eds);
      }),
    [setEdges, onEdgeConnected]
  );

  const onConnect = useCallback(
    (params: Connection) => onEdgeConnected && onEdgeConnected({ ...params }),
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
      recordNode: (props: NodeProps) => (
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

