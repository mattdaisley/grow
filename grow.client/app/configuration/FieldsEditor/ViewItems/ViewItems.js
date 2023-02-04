'use client';

import { Controller } from 'react-hook-form';
import Link from 'next/link'

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';

import { ViewGroupItems } from '../ViewGroupItems/ViewGroupItems';
import { useState } from 'react';

export function ViewItems({ view, viewControlName, ...props }) {
  return view?.groups?.map((viewGroup, viewGroupIndex) => {
    const viewGroupControlName = `${viewControlName}.groups.${viewGroupIndex}`;

    return <ViewItem
      key={viewGroup.id}
      viewId={view.id}
      viewGroup={viewGroup}
      viewGroupControlName={viewGroupControlName}
      {...props} />;
  });
}


function ViewItem({
  editorLevel, allFields, groupId, viewId, viewGroup, viewGroupControlName, control, openField, onClick,
  onDeleteViewGroup, onAddField, onRemoveField, ...props }) {

  const [addingField, setAddingField] = useState(false);
  const [addingFieldValue, setAddingFieldValue] = useState();

  if (editorLevel !== 'view') {
    return (
      <ViewGroupItems
        groupId={groupId}
        viewId={viewId}
        viewGroup={viewGroup}
        viewGroupControlName={viewGroupControlName}
        control={control}
        openField={openField}
        onClick={onClick}
        {...props} />
    )
  }

  const handleClick = () => {
    // console.log('clicked', viewGroupControlName, onClick)
    onClick && onClick(viewGroupControlName);

  };

  const handleRemoveGroupClick = () => {
    onClick && onClick(viewGroupControlName);
    onDeleteViewGroup && onDeleteViewGroup(viewGroup.id)
  }

  const handleAddFieldClick = () => {
    setAddingField(true)
  }

  const handleAddFieldConfirmClick = () => {
    console.log(addingFieldValue)
    setAddingField(false)
    onAddField && onAddField(viewGroup.id, addingFieldValue.value)
  }

  const handleRemoveFieldClick = (fieldId) => {
    onRemoveField && onRemoveField(viewGroup.id, fieldId)
  }

  const isOpen = openField?.includes(viewGroupControlName) ?? false

  let primaryDiscription = viewGroup?.label === undefined || viewGroup?.label === '' ? `Group ${viewGroup.id}` : viewGroup.label
  let secondaryDescription = ""
  if (viewGroup.type !== undefined) {
    secondaryDescription += group.type + " "
  }
  if (viewGroup.name !== undefined) {
    secondaryDescription += "for " + viewGroup.name
  }

  return <>
    {isOpen ? (
      <ListItem
        key={viewGroupControlName}
        sx={{ height: '55px' }}
        secondaryAction={<ListItemIcon sx={{ justifyContent: 'flex-end' }} onClick={handleClick}>
          <ExpandLess />
        </ListItemIcon>}>
        <Controller
          name={`${viewGroupControlName}.label`}
          control={control}
          render={({ field: formField }) => {
            // console.log(fieldArrayName, appField, field);
            return <TextField
              label="label"
              variant="standard"
              size="small"
              sx={{ fontSize: 'small' }}
              fullWidth
              placeholder={primaryDiscription}
              {...formField} />;
          }} />
      </ListItem>
    ) : (
      <ListItem
        key={viewGroupControlName}
        sx={{ height: '55px' }}
        onClick={handleClick}
        secondaryAction={<ListItemIcon sx={{ justifyContent: 'flex-end' }}>
          <ExpandMore />
        </ListItemIcon>}>
        <ListItemText primary={primaryDiscription} secondary={secondaryDescription} />
      </ListItem>
    )}
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
      <Stack spacing={2} sx={{ px: 2, py: 2 }}>
        <Box sx={{ flexGrow: 1, border: 1, borderRadius: 1, borderColor: 'grey.300' }}>
          {viewGroup.fields.map(field => (
            <FieldItemBasic key={field.id} field={field} onRemoveField={handleRemoveFieldClick} />
          ))}
          {!addingField && (
            <Box sx={{ py: 2, px: 2 }}>
              <Button variant="outlined" color="secondary" size="small" onClick={() => handleAddFieldClick()}>Add Field to Group</Button>

              <Button size="small" sx={{ ml: 2 }} onClick={handleRemoveGroupClick}>Delete Group</Button>
            </Box>
          )}
          {addingField && (
            <Box sx={{ p: 2 }}>
              <Autocomplete
                label="Field"
                autoComplete
                autoSelect
                autoHighlight
                fullWidth
                size="small"
                options={allFields.item.fields.map(field => ({ value: field.id, label: field.name }))}
                value={addingFieldValue}
                onChange={(_, newValue) => setAddingFieldValue(newValue)}
                isOptionEqualToValue={(option, testValue) => option?.id === testValue?.id}
                renderInput={(params) => <TextField {...params} label="Field" />} />
              <Button
                color="secondary"
                size="small"
                sx={{ mt: 1 }}
                disabled={addingFieldValue === undefined}
                onClick={() => handleAddFieldConfirmClick()}>
                Confirm
              </Button>
            </Box>
          )}
        </Box>
      </Stack>
    </Collapse>
    <Divider component="li" />
  </>
}

function FieldItemBasic({ field, onRemoveField }) {
  return <>
    <ListItem
      secondaryAction={
        <>
          <Link title="edit" href={`/configuration/allFields`}>
            <IconButton>
              <Edit fontSize='small' />
            </IconButton>
          </Link>
          <IconButton onClick={() => onRemoveField(field.id)}>
            <DeleteIcon fontSize='small' />
          </IconButton>
        </>
      }>
      <ListItemText primary={field.name} secondary={`FieldId: ${field.id}`} />
    </ListItem>
    <Divider component="li" />
  </>
}