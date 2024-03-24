"use client";

import { NavItem } from "./NavItem";
import { ResponsiveNavDrawer } from "./ResponsiveNavDrawer";
import useCollections from "../../../store/useCollections";

export const drawerWidth = 200;

export default function PluginNavDrawer(props) {
  // console.log("Rendering PluginNavDrawer");

  const segment = props.appKey;

  const pages = useCollections([props.pages]);
  // console.log("PluginNavDrawer", pages);
  if (!pages || !pages[props.pages.key]?.records) {
    return null;
  }

  const pageRecords = pages[props.pages.key].records;

  return (
    <ResponsiveNavDrawer segment={segment}>
      {Object.entries(pageRecords).map(([pageKey, page]) => (
        <NavItem key={pageKey} segment={segment} page={page} />
      ))}
    </ResponsiveNavDrawer>
  );
}
