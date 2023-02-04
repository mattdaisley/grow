'use client';

import { Controller } from 'react-hook-form';
import Link from 'next/link'

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Edit from '@mui/icons-material/Edit';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';

import { ViewGroupItems } from '../ViewGroupItems/ViewGroupItems';

export function ViewItems({ view, viewControlName, ...props }) {
  return view?.groups?.map((viewGroup, viewGroupIndex) => {
    const viewGroupControlName = `${viewControlName}.groups.${viewGroupIndex}`;

    return <ViewItem
      key={viewGroupControlName}
      view={view}
      viewGroup={viewGroup}
      viewGroupControlName={viewGroupControlName}
      {...props} />;
  });
}


function ViewItem({ editorLevel, groupId, view, viewGroup, viewGroupControlName, control, openField, onClick, onNewFieldClick }) {

  if (editorLevel !== 'view') {
    return (
      <ViewGroupItems
        groupId={groupId}
        viewId={view.id}
        viewGroup={viewGroup}
        viewGroupControlName={viewGroupControlName}
        control={control}
        openField={openField}
        onClick={onClick}
        onNewFieldClick={onNewFieldClick} />
    )
  }

  const handleClick = () => {
    // console.log('clicked', viewGroupControlName, onClick)
    onClick && onClick(viewGroupControlName);

  };

  const isOpen = openField?.includes(viewGroupControlName) ?? false

  let primaryDiscription = viewGroup.label ?? `Group ${viewGroup.id}`
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
            <FieldItemBasic key={field.id} field={field} />
          ))}
        </Box>
      </Stack>
    </Collapse>
    <Divider component="li" />
  </>
}

function FieldItemBasic({ field }) {
  return <>
    <ListItem
      secondaryAction={
        <Link title="edit" href={`/configuration/allFields`}>
          <Edit fontSize="small" />
        </Link>}>
      <ListItemText primary={field.name} secondary={`FieldId: ${field.id}`} />
    </ListItem>
    <Divider component="li" />
  </>
}