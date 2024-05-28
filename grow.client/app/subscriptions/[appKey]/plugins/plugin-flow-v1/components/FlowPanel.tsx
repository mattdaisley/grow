"use client";

import { Panel } from "reactflow";

import { ComponentsCollection } from "../../../store/components/ComponentsCollection";

export function FlowPanel({ panelCollection }) {
  return (
    <Panel position="top-left">
      <ComponentsCollection components={panelCollection} />
    </Panel>
  );
}
