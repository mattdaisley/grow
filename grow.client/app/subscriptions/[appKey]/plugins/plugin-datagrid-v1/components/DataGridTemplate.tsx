"use client";

import Grid from "@mui/material/Unstable_Grid2";
import { DataGrid, GridSlots } from "@mui/x-data-grid";

import { DataGridToolbar } from "./DataGridToolbar";
import { DataGridColumnMenu } from "./DataGridColumnMenu";

export function DataGridTemplate({ rows, columns, height, sortField, sortDirection, allowDelete, editable }) {
  return (
    <>
      <Grid
        data-plugin="plugin-datagrid-v1"
        xs={12}
        sx={{ height: height ? Number(height) : 402 }}
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
            toolbar: DataGridToolbar as GridSlots["toolbar"],
            columnMenu: DataGridColumnMenu as GridSlots["columnMenu"],
          }}
          slotProps={{
            toolbar: { editable, allowDelete },
            columnMenu: { editable, allowDelete },
          }}
        />
      </Grid>
    </>
  );
}

