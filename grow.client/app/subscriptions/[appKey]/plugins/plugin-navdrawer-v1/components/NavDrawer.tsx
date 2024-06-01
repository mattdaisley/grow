"use client";

import { NavItem } from "./NavItem";
import { ResponsiveNavDrawer } from "./ResponsiveNavDrawer";
import useCollections from "../../../store/useCollections";

export const drawerWidth = 200;

export default function PluginNavDrawer(props) {
  // console.log("Rendering PluginNavDrawer", props);

  const segment = props.appKey;

  const pages = useCollections([props.pages]);

  // console.log("PluginNavDrawer", pages);
  if (!pages || !pages[props.pages.key]?.records) {
    return null;
  }

  const pageRecords = pages[props.pages.key].records;

  let sortedPages = Object.entries(pageRecords);
  const sort_key = "sortOrder";

  if (
    Object.values(props.pages.schema.fields)
      .map((f: any) => f.name)
      .includes(sort_key)
  ) {
    sortedPages.sort((a, b) => {
      // console.log(a, b);
      if (a[1].value[sort_key] < b[1].value[sort_key]) {
        return -1;
      }
      if (a[1].value[sort_key] > b[1].value[sort_key]) {
        return 1;
      }
      return 0;
    });
  }

  // console.log("PluginNavDrawer", pages, pageRecords, sortedPages);

  return (
    <ResponsiveNavDrawer segment={segment}>
      {sortedPages.map(([pageKey, page]) => (
        <NavItem key={pageKey} segment={segment} page={page} />
      ))}
    </ResponsiveNavDrawer>
  );
}
