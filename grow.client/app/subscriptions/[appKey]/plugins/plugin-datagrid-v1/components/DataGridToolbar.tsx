"use client"

import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  useGridApiContext,
} from "@mui/x-data-grid";
import { Collection } from "../../../store/domain/Collection";

export function DataGridToolbar() {
  const apiRef = useGridApiContext();
  
  const selectedRows = apiRef?.current?.getSelectedRows();

  const handleDeleteClick = () => {
    const collections: {
      [collectionKey: string]: {
        collection: Collection;
        recordKeys: string[];
      };
    } = {};

    selectedRows.forEach((row) => {
      const collectionKey = row.record._collection.key;
      if (!collections[collectionKey]) {
        collections[collectionKey] = { collection: row.record._collection, recordKeys: [] }
      }

      collections[collectionKey].recordKeys.push(row.record.key);
    });

    Object.values(collections).forEach(({ collection, recordKeys }) => {
      collection.deleteRecords(recordKeys);
    });
  };

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      {/* <GridToolbarDensitySelector
        slotProps={{ tooltip: { title: "Change density" } }}
      /> */}
      <Box sx={{ flexGrow: 1 }} />
      { selectedRows && selectedRows.size > 0 && (
        <Button variant="outlined" size="small" startIcon={<DeleteIcon />} onClick={handleDeleteClick}>
          Delete
        </Button>
      )}
      <GridToolbarExport
        slotProps={{
          tooltip: { title: "Export data" },
          button: { variant: "outlined" },
        }}
      />
    </GridToolbarContainer>
  );
}
