'use client'

import { useState, useEffect, useContext } from 'react';
import { useForm, useFieldArray, useWatch, useFormContext } from "react-hook-form";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { v4 as uuidv4 } from 'uuid';

import { getCollectionFieldsAndDefaults } from '../../services/getCollectionFieldsAndDefaults';
import { RenderGroupViews } from './RenderGroupViews';
import { PageContext } from '../../app/PageContext';

export function RenderGroupCollectionAdd({ group, fieldArrayName }) {
  const [loading, setLoading] = useState(true);

  const { control, watch } = useFormContext();
  const pageContext = useContext(PageContext);

  const allFields = watch();
  // console.log(allFields)
  const pageFields = watch(pageContext.fieldArrayName);
  // console.log(group, fieldArrayName, pageFields, pageContext.fieldArrayName)

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

  const editingForm = useForm();

  useEffect(() => {
    const collectionFields = getCollectionFieldsAndDefaults(group);
    // console.log(collectionFields);
    editingForm.reset({ ...pageFields, editing: [collectionFields.fieldValues] })
    setLoading(false);
  }, [JSON.stringify(group), JSON.stringify(pageFields)])

  function onSubmit(data) {
    // console.log(data.editing[0])

    prepend({ id: uuidv4(), ...data.editing[0] });
  };

  return (
    <>
      {!loading && (
        <>
          <RenderGroupViews group={group} control={editingForm.control} fieldArrayName={`editing.0`} />

          <Box sx={{ padding: 2 }}>
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
