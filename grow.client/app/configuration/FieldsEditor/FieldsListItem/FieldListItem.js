'use client';

import { Controller } from 'react-hook-form';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';

export function FieldListItem({ field, openField, fieldControlName, control, onClick, onDeleteField }) {

  const handleClick = () => {
    onClick && onClick(fieldControlName);
  };

  const handleDeleteFieldClick = () => {
    // console.log('handleDeleteFieldClick', onDeleteField, field.id)
    onClick && onClick(fieldControlName);
    onDeleteField && onDeleteField(field.id)
  }

  const isOpen = openField?.includes(fieldControlName) ?? false

  return (
    <>
      {isOpen ? (
        <ListItem
          key={fieldControlName}
          sx={{ height: '55px' }}
          secondaryAction={<ListItemIcon sx={{ justifyContent: 'flex-end' }} onClick={handleClick}>
            <ExpandLess />
          </ListItemIcon>}>
          <Controller
            name={`${fieldControlName}.name`}
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
          key={fieldControlName}
          sx={{ height: '55px' }}
          onClick={handleClick}
          secondaryAction={<ListItemIcon sx={{ justifyContent: 'flex-end' }}>
            <ExpandMore />
          </ListItemIcon>}>
          <ListItemText primary={field.name} secondary={`id: ${field.id}`} />
        </ListItem>
      )}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Stack spacing={2} sx={{ px: 2, py: 2 }}>

          <Controller
            name={`${fieldControlName}.type`}
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
            name={`${fieldControlName}.props.label`}
            control={control}
            render={({ field: formField }) => {
              // console.log(fieldArrayName, appField, field);
              return <TextField
                label="label"
                size="small"
                fullWidth
                {...formField} />;
            }} />

          <Box>
            <Button size="small" sx={{ ml: 2 }} onClick={handleDeleteFieldClick}>Delete Field</Button>
          </Box>
        </Stack>
      </Collapse>
      <Divider component="li" />
    </>
  );
}
