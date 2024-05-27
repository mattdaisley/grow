"use client";

import PluginFlow from "./components/PluginFlow";

export default function Plugin({ nodes, edges, ...props }) {
  // console.log("plugin-flow-v1", nodes, edges, props);

  if (nodes === undefined || edges === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value?.value;
  });

  return (
    <>
      <PluginFlow
        // components={components.value}
        nodesCollection={nodes.value}
        edgesCollection={edges.value}
        {...propValues}
      />
    </>
  );
}
