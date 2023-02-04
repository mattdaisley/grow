'use client';

import { useState } from 'react';

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

import { GroupItems } from '../GroupItems/GroupItems';

export function PageItems({ page, ...props }) {
  return page?.groups?.map((group, groupIndex) => {
    const groupControlName = `groups.${groupIndex}`;

    return <PageItem
      key={groupControlName}
      group={group}
      groupControlName={groupControlName}
      {...props} />;
  });
}


function PageItem({ editorLevel, group, groupControlName, openField, control, allViews, onDeleteGroup, onAddView, onRemoveView, ...props }) {

  const [addingView, setAddingView] = useState(false);
  const [addingViewValue, setAddingViewValue] = useState();

  if (editorLevel !== 'page') {
    return (
      <GroupItems
        key={groupControlName}
        editorLevel={editorLevel}
        openField={openField}
        group={group}
        groupControlName={groupControlName}
        control={control}
        {...props} />
    )
  }

  const handleClick = () => {
    // console.log('clicked', groupControlName, onClick)
    props.onClick && props.onClick(groupControlName);

  };

  const handleRemoveGroupClick = () => {
    props.onClick && props.onClick(groupControlName);
    onDeleteGroup && onDeleteGroup(group.id)
  }

  const handleAddViewClick = () => {
    setAddingView(true)
  }

  const handleAddViewConfirmClick = () => {
    // console.log(addingViewValue)
    setAddingView(false)
    onAddView && onAddView(group.id, addingViewValue.value)
  }

  function handleRemoveView(viewId) {
    onRemoveView && onRemoveView(group.id, viewId)
  }

  const isOpen = openField?.includes(groupControlName) ?? false

  let primaryDiscription = group.label ?? `Group ${group.id}`
  let secondaryDescription = ""
  if (group.type !== undefined) {
    secondaryDescription += group.type + " "
  }
  if (group.name !== undefined) {
    secondaryDescription += "for " + group.name
  }

  return <>
    {isOpen ? (
      <ListItem
        key={groupControlName}
        sx={{ height: '55px' }}
        secondaryAction={<ListItemIcon sx={{ justifyContent: 'flex-end' }} onClick={handleClick}>
          <ExpandLess />
        </ListItemIcon>}>
        <Controller
          name={`${groupControlName}.label`}
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
        key={groupControlName}
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

        <Controller
          name={`${groupControlName}.type`}
          control={control}
          render={({ field: { value, onChange } }) => {

            return (
              <Autocomplete
                label="type"
                autoComplete
                autoSelect
                autoHighlight
                fullWidth
                size="small"
                options={["None", "collection-tabs", "collection-grid", "collection-add"]}
                value={value}
                onChange={(_, newValue) => onChange(newValue)}
                isOptionEqualToValue={(option, testValue) => option === testValue}
                renderInput={(params) => <TextField {...params} label="type" />} />
            );
          }} />

        <Controller
          name={`${groupControlName}.name`}
          control={control}
          render={({ field: formField }) => {
            // console.log(fieldArrayName, appField, field);
            return <TextField
              label="for"
              size="small"
              fullWidth
              {...formField} />;
          }} />

        <Box sx={{ flexGrow: 1, border: 1, borderRadius: 1, borderColor: 'grey.300' }}>
          {group.views.map((view, index) => (
            <ViewItemBasic key={view.id + index} view={view} onRemoveView={handleRemoveView} />
          ))}
          {!addingView && (
            <Box sx={{ py: 2, px: 2 }}>
              <Button variant="outlined" color="secondary" size="small" onClick={() => handleAddViewClick()}>Add View to Group</Button>

              <Button size="small" sx={{ ml: 2 }} onClick={handleRemoveGroupClick}>Delete Group</Button>
            </Box>
          )}
          {addingView && (
            <Box sx={{ p: 2 }}>
              <Autocomplete
                label="View"
                autoComplete
                autoSelect
                autoHighlight
                fullWidth
                size="small"
                options={allViews.item.views.map(view => ({ value: view.id, label: view.name }))}
                value={addingViewValue}
                onChange={(_, newValue) => setAddingViewValue(newValue)}
                isOptionEqualToValue={(option, testValue) => option?.id === testValue?.id}
                renderInput={(params) => <TextField {...params} label="View" />} />
              <Button
                color="secondary"
                size="small"
                sx={{ mt: 1 }}
                disabled={addingViewValue === undefined}
                onClick={() => handleAddViewConfirmClick()}>
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

function ViewItemBasic({ view, onRemoveView }) {
  return <>
    <ListItem
      secondaryAction={
        <>
          <Link title="edit" href={`/configuration/allViews/${encodeURIComponent(view.id)}`}>
            <IconButton>
              <Edit fontSize='small' />
            </IconButton>
          </Link>
          <IconButton onClick={() => onRemoveView(view.id)}>
            <DeleteIcon fontSize='small' />
          </IconButton>
        </>
      }>
      <ListItemText primary={view.name} secondary={`ViewId: ${view.id}`} />
    </ListItem>
    <Divider component="li" />
  </>
}