'use client'

import { useState, useEffect, useContext } from 'react';
import { useForm, useFieldArray, useWatch, useFormContext } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';

import { getCollectionFieldsAndDefaults } from '../../services/getCollectionFieldsAndDefaults';
import { RenderGroupViews } from './RenderGroupViews';
import { PageContext } from '../../app/PageContext';

export function RenderGroupCollectionAdd({ group, fieldArrayName }) {
  const [loading, setLoading] = useState(true);

  const { control, watch } = useFormContext();
  const pageContext = useContext(PageContext);

  const pageFields = watch();
  // console.log(group, fieldArrayName, pageFields, pageContext.fieldArrayName)

  let collectionName = group.name ?? "collection";

  const { prepend } = useFieldArray({
    control,
    name: collectionName
  });

  const editingForm = useForm();

  useEffect(() => {
    const collectionFields = getCollectionFieldsAndDefaults(group);
    // console.log(collectionFields);
    const editingFormDefaults = { ...pageFields, editing: [collectionFields.fieldValues] };
    // console.log(editingFormDefaults);
    editingForm.reset(editingFormDefaults)
    setLoading(false);
  }, [JSON.stringify(group), JSON.stringify(pageFields)])

  function onSubmit(data) {
    // console.log(data, data.editing[0])

    prepend({ id: uuidv4(), ...data.editing[0] });
  };

  // console.log(editingForm)

  return (
    <>
      {!loading && (
        <>
          <Grid container spacing={2} sx={{ p: 1 }}>
            <RenderGroupViews group={group} control={editingForm.control} fieldArrayName={`editing.0`} />
          </Grid>

          <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'grey.300' }}>
            {group.actions?.map((action, index) => {
              if (action.type === 'submit') {
                return <Button key={index} onClick={editingForm.handleSubmit(onSubmit)}>{action.label}</Button>
              }
              return null;
            })}
          </Box>
        </>
      )}

    </>
  );
}
