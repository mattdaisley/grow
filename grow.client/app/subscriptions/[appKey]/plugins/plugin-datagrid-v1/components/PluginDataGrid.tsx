"use client";

import { Box } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import useCollections from "../../../store/useCollections";
import { Collection } from "../../../store/domain/Collection";
import { DataGridRow } from "./DataGridRow";

export const drawerWidth = 200;

interface IPluginDataGridProps {
  dataSource: Collection;
}

export default function PluginDataGrid({
  dataSource,
  ...props
}: IPluginDataGridProps) {
  // console.log("Rendering PluginDataGrid");

  const listItems = useCollections([dataSource]);
  if (!listItems || !listItems[dataSource.key]?.records) {
    return null;
  }
  // console.log("PluginDataGrid", listItems);

  const listItemRecords = listItems[dataSource.key].records;
  const schema = listItems[dataSource.key].schema;

  const columns: GridColDef<(typeof rows)[number]>[] = Object.entries(
    schema.fields
  ).map(([key, field]) => {
    // console.log("columns", key, field);

    return {
      field: key,
      headerName: field.name,
      width: 200,
      renderCell: (params) => {
        // console.log(params);
        return <DataGridRow record={params.row.record} field={params.value} />;
      },
    };
  });

  const rows = Object.entries(listItemRecords).map(([key, record]) => {
    // console.log("id", key, "record", record);
    return {
      id: key,
      record,
      ...record.schema.fields,
    };
  });

  return (
    <>
      {/* <Grid xs={12} sx={{ pl: 2, pr: 2 }}>
        <h3>
          {dataSource.key} - {schema.display_name}
        </h3>
      </Grid> */}

      <Grid xs={12} sx={{ padding: 2, height: 402 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              pageSize: 5,
            },
          }}
          rowsPerPageOptions={[5, 10]}
        />
      </Grid>
    </>
  );
}
