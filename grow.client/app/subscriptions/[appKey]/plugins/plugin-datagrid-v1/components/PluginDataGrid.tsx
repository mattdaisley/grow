"use client";

import { Box } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import useCollections from "../../../store/useCollections";
import { Collection } from "../../../store/domain/Collection";
import { DataGridCell } from "./DataGridCell";

export const drawerWidth = 200;

interface IPluginDataGridProps {
  dataSource: Collection;
  height?: string;
  editable?: boolean;
}

export default function PluginDataGrid({
  dataSource,
  height,
  editable,
  ...props
}: IPluginDataGridProps) {
  // console.log("Rendering PluginDataGrid", dataSource, height, editable);

  const listItems = useCollections([dataSource]);
  // console.log("PluginDataGrid", listItems, dataSource);
  if (!listItems || !listItems[dataSource.key]?.records) {
    return null;
  }
  // console.log("PluginDataGrid", listItems);

  const listItemRecords = listItems[dataSource.key].records;
  const schema = listItems[dataSource.key].schema;

  const columns: GridColDef<(typeof rows)[number]>[] = Object.entries({
    id: { name: "Id" },
    ...schema.fields,
  }).map(([key, field]) => {
    // console.log("columns", key, field);

    const cell: GridColDef<(typeof rows)[number]> = {
      field: key,
      headerName: field.name,
      width: 200,
    };

    if (key !== "id") {
      cell.renderCell = (params) => {
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

  return <DataGridTemplate rows={rows} columns={columns} height={height} />;
}

function DataGridTemplate({ rows, columns, height }) {
  return (
    <>
      {/* <Grid xs={12} sx={{ pl: 2, pr: 2 }}>
        <h3>
          {dataSource.key} - {schema.display_name}
        </h3>
      </Grid> */}

      <Grid xs={12} sx={{ padding: 2, height: height ? Number(height) : 402 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </Grid>
    </>
  );
}
