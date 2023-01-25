'use client'

import { useState, useEffect } from 'react';
import { useFormContext } from "react-hook-form";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { DataGrid } from '@mui/x-data-grid';

import { getCollectionFieldsAndDefaults } from '../../services/getCollectionFieldsAndDefaults';

export function RenderGroupCollectionDataGrid({ group, fieldArrayName }) {

  const [groupCollectionFields, setGroupCollectionFields] = useState(true);

  const { watch } = useFormContext();

  let collectionName = group.name ?? "collection";
  const collectionFieldArrayName = `${fieldArrayName}.${collectionName}`;

  const watchCollectionFields = watch(collectionFieldArrayName);

  // console.log(fieldArrayName, collectionFieldArrayName, watchCollectionFields)

  useEffect(() => {
    const collectionFields = getCollectionFieldsAndDefaults(group);
    setGroupCollectionFields(collectionFields)
    // console.log(collectionFields);
  }, [JSON.stringify(group)])

  let columns = []
  if (groupCollectionFields?.collection !== undefined) {
    columns.push({ field: 'id', headerName: 'id', flex: 1 })

    const fieldColumns = groupCollectionFields.collection.map(field => ({
      field: field.name, headerName: field.props?.label, flex: 1
    }))

    columns = [...columns, ...fieldColumns]
  }
  // console.log(columns)
  // console.log(watchFields, groupCollectionFields)

  // Todo: instead of directly using watchFields for the rows, add a valueGetter to the column to look up the value in the field array.
  //       this will allow for calculated fields and let us get the label for autocomplete and select

  return (
    <>
      <Grid container alignItems={'center'}>
        <Box sx={{
          padding: 2,
          height: 400,
          width: '100%',
          borderBottom: 1,
          borderColor: 'grey.400'
        }}>
          <DataGrid
            rows={watchCollectionFields ?? []}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20]}
          />
        </Box>
      </Grid>

    </>
  );
}
