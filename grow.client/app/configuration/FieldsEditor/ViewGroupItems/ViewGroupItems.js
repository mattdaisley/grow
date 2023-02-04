'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { FieldListItem } from '../FieldsListItem/FieldListItem';

export function ViewGroupItems({ groupId, viewId, viewGroup, viewGroupControlName, onNewFieldClick, ...props }) {

  return (
    <>
      {viewGroup.fields?.map((field, fieldIndex) => {
        const fieldControlName = `${viewGroupControlName}.fields.${fieldIndex}`;
        return (
          <FieldListItem
            key={field.id}
            field={field}
            fieldControlName={fieldControlName}
            {...props}/>
        );
      })}
      <Box sx={{ p: 2 }}>
        <Button onClick={() => onNewFieldClick(groupId, viewId, viewGroup.id)}>Add New Field</Button>
      </Box>
    </>
  );
}
