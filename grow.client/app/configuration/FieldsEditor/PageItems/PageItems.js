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


function PageItem({ editorLevel, group, groupControlName, control, openField, onClick, onNewFieldClick }) {

  const groupItems = () => (
    <GroupItems
      key={groupControlName}
      editorLevel={editorLevel}
      group={group}
      groupControlName={groupControlName}
      control={control}
      openField={openField}
      onClick={onClick}
      onNewFieldClick={onNewFieldClick} />
  )

  if (editorLevel !== 'page') {
    return groupItems()
  }

  const handleClick = () => {
    // console.log('clicked', groupControlName, onClick)
    onClick && onClick(groupControlName);

  };

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
          {group.views.map(view => (
            <ViewItemBasic key={view.id} view={view} />
          ))}
        </Box>
      </Stack>
    </Collapse>
    <Divider component="li" />
  </>
}

function ViewItemBasic({ view }) {
  return <>
    <ListItem
      secondaryAction={
        <Link title="edit" href={`/configuration/allViews/${encodeURIComponent(view.id)}`}>
          <Edit fontSize="small" />
        </Link>}>
      <ListItemText primary={view.name} secondary={`ViewId: ${view.id}`} />
    </ListItem>
    <Divider component="li" />
  </>
}