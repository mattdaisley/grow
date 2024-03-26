"use client";

import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import useCollections from "../../../store/useCollections";
import { Collection } from "../../../store/domain/Collection";

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

  const columns: GridColDef<(typeof rows)[number]>[] = Object.values(
    schema.fields
  ).map((field) => {
    if (field.type === "collection") {
      return {
        field: field.name,
        headerName: field.display_name,
        width: 200,
        renderCell: (params) => {
          // console.log(params);
          return (
            <>
              {params.value.key} - {params.value.schema.display_name}
            </>
          );
        },
      };
    }

    return {
      field: field.name,
      headerName: field.display_name,
      width: 200,
    };
  });

  const rows = Object.entries(listItemRecords).map(([key, record]) => {
    return {
      id: key,
      ...record.value,
    };
  });

  return (
    <Box sx={{ padding: 2, height: 402, mb: 6 }}>
      <h3>
        {dataSource.key} - {schema.display_name}
      </h3>
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
    </Box>
  );
}
