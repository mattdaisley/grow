"use client";

import PluginContainer from "./components/Container";

interface IPluginContainerProps {
  components: {
    [pageKey: string]: Object;
  };
  width?: string;
  margin?: string;
  paper?: boolean;
}

export default function Plugin({
  components,
  width,
  margin,
  paper,
  ...props
}: IPluginContainerProps) {
  // console.log("plugin-container-v1", components, width, props);

  if (components === undefined) {
    return null;
  }

  return (
    <>
      <PluginContainer
        components={components}
        width={width}
        margin={margin}
        paper={paper}
      />
    </>
  );
}
