'use client'

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from "react-hook-form";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import { DataGrid } from '@mui/x-data-grid';
import { v4 as uuidv4 } from 'uuid';

import { getCollectionFieldsAndDefaults } from '../../services/getCollectionFieldsAndDefaults';
import { RenderGroupViews } from './RenderGroupViews';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { value, index, group, control, fieldArrayName } = props;

  const collectionFieldArrayName = `${fieldArrayName}.${value}`;

  return <>
    {value === index && (
      <RenderGroupViews group={group} control={control} fieldArrayName={collectionFieldArrayName} />
    )}
  </>;
}

export function RenderGroupCollectionDataGrid({ group, control, fieldArrayName }) {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [groupCollectionFields, setGroupCollectionFields] = useState(true);

  let collectionName = group.name ?? "collection";
  const collectionFieldArrayName = `${fieldArrayName}.${collectionName}`;

  const watchFields = useWatch({
    control,
    name: fieldArrayName
  });

  // console.log(fieldArrayName, watchFields)

  const { fields, prepend } = useFieldArray({
    control,
    name: collectionFieldArrayName
  });

  const watchCollectionFields = useWatch({
    control,
    name: collectionFieldArrayName
  });

  const editingForm = useForm();

  useEffect(() => {
    const collectionFields = getCollectionFieldsAndDefaults(group);
    setGroupCollectionFields(collectionFields)
    // console.log(collectionFields);
    editingForm.reset({ ...watchFields, editing: [collectionFields.fieldValues] })
    setLoading(false);
  }, [JSON.stringify(group), value, JSON.stringify(watchFields)])

  function onSubmit(data) {
    console.log(data)

    prepend({ id: uuidv4(), ...data.editing[0] });
    setValue(value + 1);
  };

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
      {!loading && (
        <>
          <RenderGroupViews group={group} control={editingForm.control} fieldArrayName={`editing.0`} />

          <Box sx={{ padding: 2 }}>
            <Button onClick={editingForm.handleSubmit(onSubmit)}>Add Item</Button>
          </Box>
        </>
      )}

    </>
  );
}
