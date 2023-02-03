'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { FieldListItem } from '../FieldsListItem/FieldListItem';

export function ViewGroupItems({ groupId, viewId, viewGroup, openField, viewGroupControlName, control, onClick, onNewFieldClick }) {

  return (
    <>
      {viewGroup.fields?.map((field, fieldIndex) => {
        const fieldControlName = `${viewGroupControlName}.fields.${fieldIndex}`;
        return (
          <FieldListItem
            key={field.id}
            field={field}
            fieldControlName={fieldControlName}
            control={control}
            openField={openField}
            onClick={onClick} />
        );
      })}
      <Box sx={{ p: 2 }}>
        <Button onClick={() => onNewFieldClick(groupId, viewId, viewGroup.id)}>Add New Field</Button>
      </Box>
    </>
  );
}
