"use client";

import { GridComparatorFn, gridDateComparator, gridNumberComparator, gridStringOrNumberComparator } from "@mui/x-data-grid";

export const recordValueSortComparator: GridComparatorFn = (v1, v2, param1, param2) => {
  // console.log(
  //   "recordValueSortComparator",
  //   v1,
  //   v2,
  //   param1.api?.getCellParams(param1.id, param1.field)?.formattedValue
  // );
  let param1TextContent = param1.api?.getCellParams(param1.id, param1.field)?.formattedValue;

  if (param1TextContent === undefined) {
    param1TextContent = param1.api?.getCellElement(param1.id, param1.field)?.textContent ?? v1;
  }

  let param2TextContent = param2.api?.getCellParams(param2.id, param2.field)?.formattedValue;

  if (param2TextContent === undefined) {
    param2TextContent = param2.api?.getCellElement(param2.id, param2.field)?.textContent ?? v2;
  }

  // console.log("recordValueSortComparator", v1, v2, param1, param2, param1TextContent, param2TextContent);
  if (v1.type === 'date' && v2.type === 'date') {
    return gridDateComparator(param1TextContent, param2TextContent, param1, param2);
  }

  if (v1.type === 'number' && v2.type === 'number') {
    return gridNumberComparator(param1TextContent, param2TextContent, param1, param2);
  }

  // type is string or anything else
  return gridStringOrNumberComparator(param1TextContent, param2TextContent, param1, param2);
};
