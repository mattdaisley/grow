"use client";
import { flatten } from "flat";

export function Text(props) {
  const flattenedSource = flatten(props.source);

  return <>{flattenedSource[props.selector]}</>;
}
