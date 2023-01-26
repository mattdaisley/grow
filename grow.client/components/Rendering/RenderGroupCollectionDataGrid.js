'use client'

import { useState, useEffect, useContext } from 'react';
import { useFormContext } from "react-hook-form";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { DataGrid } from '@mui/x-data-grid';

import { getCollectionFieldsAndDefaults } from '../../services/getCollectionFieldsAndDefaults';
import { PageContext } from '../../app/PageContext';


function getAutocompleteItemComputedLabel(fieldValue, computedOptions, fields) {
  if (computedOptions === undefined || Object.keys(computedOptions).length === 0) {
    return "";
  }
  const options = fields[computedOptions.key];

  const matchingOption = options[fieldValue.value]
  // console.log(matchingOption, computedOptions, matchingOption[computedOptions.label])
  return matchingOption[computedOptions.label]
}

function getSelectItemComputedLabel(fieldValue, computedOptions, fields) {
  if (computedOptions === undefined || Object.keys(computedOptions).length === 0) {
    return "";
  }

  const options = fields[computedOptions.key];

  return options[fieldValue][computedOptions.label]
}

export function RenderGroupCollectionDataGrid({ group, fieldArrayName }) {

  const [groupCollectionFields, setGroupCollectionFields] = useState(undefined);

  const pageFormContext = useFormContext();
  const pageContext = useContext(PageContext);

  const fields = pageFormContext.watch(pageContext.fieldArrayName);

  let collectionName = group.name ?? "collection";
  const collectionFieldArrayName = `${fieldArrayName}.${collectionName}`;

  const watchCollectionFields = pageFormContext.watch(collectionFieldArrayName);

  // console.log(fieldArrayName, groupCollectionFields, watchCollectionFields)

  let rows = []
  if (groupCollectionFields?.collection !== undefined) {

    const collectionFieldsByName = {}
    groupCollectionFields.collection.forEach(collectionField => collectionFieldsByName[collectionField.name] = collectionField)

    rows = watchCollectionFields?.map(collectionRow => {

      let computedRow = {}

      for (let i = 0; i < Object.keys(collectionRow).length; i++) {
        const fieldName = Object.keys(collectionRow)[i];
        const fieldValue = collectionRow[fieldName];
        const fieldDefinition = collectionFieldsByName[fieldName];
        // console.log(fieldName, fieldValue, fieldDefinition)
        if (fieldDefinition === undefined) {
          computedRow[fieldName] = fieldValue;
          continue;
        }

        switch (fieldDefinition.type) {
          case 'select':
            computedRow[fieldName] = getSelectItemComputedLabel(fieldValue, fieldDefinition.props.computedOptions, fields)

            if (computedRow[fieldName] === "") {
              computedRow[fieldName] = fieldDefinition;
            }
            break;
          case 'autocomplete':
            computedRow[fieldName] = getAutocompleteItemComputedLabel(fieldValue, fieldDefinition.props.computedOptions, fields)

            if (computedRow[fieldName] === "") {
              computedRow[fieldName] = fieldDefinition;
            }
            break;
          default:
            computedRow[fieldName] = fieldValue;
            break;
        }
      }
      return computedRow;
    })
  }
  // console.log(rows);

  useEffect(() => {
    const collectionFields = getCollectionFieldsAndDefaults(group);
    setGroupCollectionFields(collectionFields)
    // console.log(collectionFields);
  }, [JSON.stringify(group)])

  let columns = []
  if (groupCollectionFields?.collection !== undefined) {
    columns.push({ field: 'id', headerName: 'id', flex: 1 })

    const fieldColumns = groupCollectionFields.collection.map(fieldDefinition => ({
      field: fieldDefinition.name, headerName: fieldDefinition.props?.label, flex: 1
    }))

    columns = [...columns, ...fieldColumns]
  }
  // console.log(columns)
  // console.log(watchFields, groupCollectionFields)

  return (
    <>
      <Grid container alignItems={'center'}>
        <Box sx={{
          padding: 2,
          height: 430,
          width: '100%',
          borderBottom: 1,
          borderColor: 'grey.400'
        }}>
          <DataGrid
            rows={rows ?? []}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20]}
          />
        </Box>
      </Grid>

    </>
  );
}
