'use client';

import { Controller } from 'react-hook-form';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';

import { ViewItems } from '../ViewItems/ViewItems';

export function GroupItems({ group, groupControlName, ...props }) {

  return group.views?.map((view, viewIndex) => {
    const viewControlName = `${groupControlName}.views.${viewIndex}`;

    return <GroupItem key={viewControlName} group={group} view={view} viewControlName={viewControlName} {...props} />
  });
}

function GroupItem({ editorLevel, group, view, viewControlName, openField, ...props }) {

  if (editorLevel !== 'page') {
    return (
      <ViewItems
        editorLevel={editorLevel}
        groupId={group.id}
        view={view}
        viewControlName={viewControlName}
        openField={openField}
        {...props} />
    )
  }

  const handleClick = () => {
    // console.log('clicked', viewControlName, onClick)
    props.onClick && props.onClick(viewControlName);
  };

  const isOpen = openField?.includes(viewControlName) ?? false

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
        key={viewControlName}
        sx={{ height: '55px' }}
        secondaryAction={<ListItemIcon sx={{ justifyContent: 'flex-end' }} onClick={handleClick}>
          <ExpandLess />
        </ListItemIcon>}>
        <Controller
          name={`${viewControlName}.name`}
          control={control}
          render={({ field: formField }) => {
            // console.log(fieldArrayName, appField, field);
            return <TextField
              label="name"
              variant="standard"
              size="small"
              sx={{ fontSize: 'small' }}
              fullWidth
              {...formField} />;
          }} />
      </ListItem>
    ) : (
      <ListItem
        key={viewControlName}
        sx={{ height: '55px' }}
        onClick={handleClick}
        secondaryAction={<ListItemIcon sx={{ justifyContent: 'flex-end' }}>
          <ExpandMore />
        </ListItemIcon>}>
        <ListItemText primary={view.name} />
      </ListItem>
    )}
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
      <Stack spacing={2} sx={{ px: 2, py: 2 }}>

        <Controller
          name={`${viewControlName}.type`}
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
                options={["autocomplete", "select", "text", "numeric", "checkbox", "label"]}
                value={value}
                onChange={(_, newValue) => onChange(newValue)}
                isOptionEqualToValue={(option, testValue) => option === testValue}
                renderInput={(params) => <TextField {...params} label="type" />} />
            );
          }} />

        <Controller
          name={`${viewControlName}.label`}
          control={control}
          render={({ field: formField }) => {
            // console.log(fieldArrayName, appField, field);
            return <TextField
              label="label"
              size="small"
              fullWidth
              {...formField} />;
          }} />

        <Box sx={{ flexGrow: 1, border: 1, borderRadius: 1, borderColor: 'grey.300' }}>
          <ListItem
            key={viewControlName}>
            <ListItemText primary={view.name} secondary={`ViewId: ${view.id}`} />
          </ListItem>
        </Box>
      </Stack>
    </Collapse>
    <Divider component="li" />
  </>
}