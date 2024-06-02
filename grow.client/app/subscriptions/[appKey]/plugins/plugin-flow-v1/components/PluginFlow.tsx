"use client";

import { Collection } from "../../../store/domain/Collection";
import useCollections from "../../../store/useCollections";
import { FlowDiagram } from "./FlowDiagram";

interface IPluginFlowProps {
  edgesCollection: Collection,
  nodesCollection: Collection,
  panel?: Collection
  viewport?: Collection,
}

export default function PluginFlow({
  edgesCollection,
  nodesCollection,
  panel,
  viewport,
  ...props
}: IPluginFlowProps) {
  const useCollectionsResponse = useCollections([
    edgesCollection,
    nodesCollection,
  ]);
  // console.log("PluginFlow useCollectionsResponse", useCollectionsResponse);
  if (!useCollectionsResponse) {
    return null;
  }

  const edgeRecords = useCollectionsResponse[edgesCollection.key]?.records;
  const nodeRecords = useCollectionsResponse[nodesCollection.key]?.records;
  // console.log("PluginFlow nodeRecords and edgeRecords", nodeRecords, edgeRecords);

  if (!edgeRecords || !nodeRecords) {
    return null;
  }

  const edges = Object.entries(edgeRecords).map(([key, edgeRecord]) => {
    const { source, target } = edgeRecord.value as any;

    return {
      id: key,
      source,
      target,
    };
  });

  const nodes = Object.entries(nodeRecords).map(([key, nodeRecord]) => {
    const { x, y, label } = nodeRecord.value as any;

    return {
      id: key,
      type: "recordNode",
      position: { x, y },
      data: { record: nodeRecord, label },
    };
  });

  // console.log('PluginFlow nodes and edges', nodes, edges)
  const handleEdgeConnected = (newEdge) => {
    // console.log("handleEdgeConnected", newEdge);

    const contents = {};
    if (edgesCollection?.schema !== undefined) {
      const target_field_key = Object.keys(edgesCollection.schema.fields).find(
        (key) => edgesCollection.schema.fields[key].name === "target"
      );
      const source_field_key = Object.keys(edgesCollection.schema.fields).find(
        (key) => edgesCollection.schema.fields[key].name === "source"
      );

      contents[target_field_key] = newEdge.target;
      contents[source_field_key] = newEdge.source;
    }

    // console.log("handleEdgeConnected", contents);

    edgesCollection.createRecord(contents);
  };

  const handleEdgeRemoved = (recordKey: string) => {
    // console.log("handleEdgeRemoved", edge);
    edgesCollection.deleteRecords([recordKey]);
  };

  const handleNodeRemoved = (recordKey: string) => {
    // console.log("handleNodeRemoved", recordKey);
    nodesCollection.deleteRecords([recordKey]);
  }

  return (
    <>
      <FlowDiagram
        initialEdges={edges}
        initialNodes={nodes}
        onEdgeConnected={handleEdgeConnected}
        onEdgeRemoved={handleEdgeRemoved}
        onNodeRemoved={handleNodeRemoved}
        panelCollection={panel}
        viewportCollection={viewport}
      />
    </>
  );
}
