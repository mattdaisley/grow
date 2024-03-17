"use client";

import { NavItem } from "./NavItem";
import { ResponsiveNavDrawer } from "./ResponsiveNavDrawer";
import useCollection from "../../../store/useCollection";

export const drawerWidth = 200;

export default function PluginNavDrawer(props) {
  // console.log("Rendering PluginNavDrawer");

  const segment = props.appKey;

  const pages = useCollection(props.pages);

  return (
    <ResponsiveNavDrawer segment={segment}>
      {Object.entries(pages).map(([pageKey, page]) => (
        <NavItem key={pageKey} segment={segment} page={page} />
      ))}
    </ResponsiveNavDrawer>
  );
}
