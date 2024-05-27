"use client";

import { GridColDef } from "@mui/x-data-grid";

import useCollections from "../../../store/useCollections";
import { Collection } from "../../../store/domain/Collection";
import { DataGridCell } from "./DataGridCell";
import { DataGridTemplate } from "./DataGridTemplate";
import { recordValueSortComparator } from "./recordValueSortComparator";

export const drawerWidth = 200;

interface IPluginDataGridProps {
  dataSource: Collection;
  height?: string;
  allowDelete?: boolean;
  editable?: boolean;
  sortField?: string;
  sortDirection?: string;
}

export default function PluginDataGrid({
  dataSource,
  height,
  allowDelete,
  editable,
  sortField,
  sortDirection,
  ...props
}: IPluginDataGridProps) {
  // console.log("Rendering PluginDataGrid", dataSource, height, editable, props);

  const listItems = useCollections([dataSource]);
  // console.log("PluginDataGrid", listItems, dataSource);
  if (!listItems || !listItems[dataSource.key]?.records) {
    return null;
  }
  // console.log("PluginDataGrid", listItems);

  const listItemRecords = listItems[dataSource.key].records;
  const schema = listItems[dataSource.key].schema;
  // console.log("PluginDataGrid", sortField, JSON.stringify(schema.fields, null, 2));

  const sortFieldKeyPair = Object.entries(schema.fields).find(([key, field]) => field.name === sortField);
  const sortFieldKey = sortFieldKeyPair && sortFieldKeyPair.length > 0 ? sortFieldKeyPair[0] : "id";

  const columns: GridColDef<(typeof rows)[number]>[] = Object.entries({
    id: { name: "Id", type: "primaryKey" },
    ...schema.fields,
  }).map(([key, field]: [string, { name: string; type: string }]) => {
    // console.log("columns", key, field);

    const cell: GridColDef<(typeof rows)[number]> = {
      field: key,
      headerName: `${field.name} (${field.type})`,
      width: 180,
      sortComparator: recordValueSortComparator,
      valueFormatter: (value, row) => {
        if (key === "id") {
          return value;
        }

        const displayValue = row.record.getDisplayValueByFieldName(field.name);
        // console.log("valueFormatter", key, field.name, displayValue, value, row);

        return displayValue;
      }
    };

    if (key !== "id") {
      cell.renderCell = (params) => {
        // console.log("renderCell", params);
        if (!params?.value) {
          console.log("renderCell !params?.value", params);
          return null;
        }

        return (
          <DataGridCell
            record={params.row.record}
            field={params.value}
            editable={editable}
          />
        );
      };
    }

    return cell;
  });
  // columns.unshift({ field: "id", headerName: "ID", width: 200 });

  const rows = Object.entries(listItemRecords).map(([key, record]) => {
    // console.log("id", key, "record", record);
    return {
      id: key,
      record,
      ...record.schema.fields,
    };
  });

  return (
    <DataGridTemplate
      rows={rows}
      columns={columns}
      height={height}
      sortField={sortFieldKey}
      sortDirection={sortDirection}
      allowDelete={allowDelete}
      editable={editable}
    />
  );
}


