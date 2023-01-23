import { useState } from 'react';
import { Controller } from "react-hook-form";

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { Item } from '../Item';

export const SelectItem = ({ appField, control, fieldArrayName }) => {

  const { options, ...props } = appField.props;
  const selectControl =
    <Controller
      name={`${fieldArrayName}.${appField.name}`}
      control={control}
      render={({ field }) => {

        return <Select
          size="small"
          {...props}
          labelId={`select-${appField.id}-label`}
          id={`select-${appField.id}`}
          {...field}
        >
          {options?.map((option, j) => {
            return <MenuItem key={j} value={option.value}>
              {option.label}
            </MenuItem>;
          })}
        </Select>
      }}
    />;

  return <Item>
    {!!appField.props.label
      ? (
        <FormControl fullWidth={true} {...appField.props}>
          <InputLabel
            size="small"
            id={`select-${appField.id}-label`}>{appField.props.label}</InputLabel>
          {selectControl}
        </FormControl>
      )
      : { selectControl }}
  </Item>;
};
