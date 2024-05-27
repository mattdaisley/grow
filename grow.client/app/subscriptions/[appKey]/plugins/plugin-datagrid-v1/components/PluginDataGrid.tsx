"use client";

import Grid from "@mui/material/Unstable_Grid2";
import { DataGrid, GridColDef, GridComparatorFn, gridDateComparator, gridNumberComparator, gridStringOrNumberComparator } from "@mui/x-data-grid";

import useCollections from "../../../store/useCollections";
import { Collection } from "../../../store/domain/Collection";
import { DataGridCell } from "./DataGridCell";
import { DataGridToolbar } from "./DataGridToolbar";

export const drawerWidth = 200;

interface IPluginDataGridProps {
  dataSource: Collection;
  height?: string;
  editable?: boolean;
  sortField?: string;
  sortDirection?: string;
}

const recordValueSortComparator: GridComparatorFn = (v1, v2, param1, param2) => {
  // console.log(
  //   "recordValueSortComparator",
  //   v1,
  //   v2,
  //   param1.api?.getCellParams(param1.id, param1.field)?.formattedValue
  // );

  let param1TextContent =
    param1.api?.getCellParams(param1.id, param1.field)?.formattedValue

  if (param1TextContent === undefined) {
    param1TextContent = param1.api?.getCellElement(param1.id, param1.field)?.textContent ?? v1;
  }
  
  let param2TextContent =
    param2.api?.getCellParams(param2.id, param2.field)?.formattedValue;

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

export default function PluginDataGrid({
  dataSource,
  height,
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
    />
  );
}

function DataGridTemplate({ rows, columns, height, sortField, sortDirection }) {
  return (
    <>
      {/* <Grid xs={12} sx={{ pl: 2, pr: 2 }}>
        <h3>
          {dataSource.key} - {schema.display_name}
        </h3>
      </Grid> */}

      <Grid
        data-plugin="plugin-datagrid-v1"
        xs={12}
        sx={{ px: 2, pb: 2, height: height ? Number(height) : 402 }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
            sorting: {
              sortModel: [
                {
                  field: sortField ?? "id",
                  sort: sortDirection ?? "asc",
                },
              ],
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          slots={{
            toolbar: DataGridToolbar,
          }}
        />
      </Grid>
    </>
  );
}
