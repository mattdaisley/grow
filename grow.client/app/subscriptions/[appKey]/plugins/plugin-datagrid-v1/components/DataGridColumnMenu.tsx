"use client";

import { GridColumnMenuContainer, GridColumnMenuFilterItem, GridColumnMenuHideItem, GridColumnMenuProps, GridColumnMenuSortItem } from "@mui/x-data-grid";

declare module "@mui/x-data-grid" {
  interface ColumnMenuPropsOverrides {
    allowDelete?: boolean;
    editable?: boolean;
  }
}
type CustomGridColumnMenuProps = {
  allowDelete?: boolean;
  editable?: boolean;
};
export function DataGridColumnMenu(props: GridColumnMenuProps & CustomGridColumnMenuProps) {
  const { hideMenu, colDef, allowDelete, editable, ...other } = props;
  return (
    <GridColumnMenuContainer hideMenu={hideMenu} colDef={colDef} {...other}>
      <GridColumnMenuSortItem onClick={hideMenu} colDef={colDef!} />
      <GridColumnMenuFilterItem onClick={hideMenu} colDef={colDef!} />
      <GridColumnMenuHideItem onClick={hideMenu} colDef={colDef!} />
    </GridColumnMenuContainer>
  );
}
