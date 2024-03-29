import { useContext } from 'react';
import { Controller, useFormContext } from "react-hook-form";

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { Item } from '../Item';

export const SelectItem = ({ appField, control, fieldArrayName }) => {

  const { options, computedOptions, ...props } = appField.props;
  // console.log(fieldArrayName);

  const controllerName = (fieldArrayName !== undefined) ? `${fieldArrayName}.${appField.name}` : appField.name;

  const pageFormContext = useFormContext();
  const fields = pageFormContext.watch();
  // console.log(fields, fieldArrayName)

  function getComputedMenuItems(computedOptions) {
    if (computedOptions === undefined || Object.keys(computedOptions).length === 0) {
      return [];
    }

    // console.log(props, computedOptions, fields[computedOptions.key]);

    const options = fields[computedOptions.key];

    let menuItems = [<MenuItem key={0} value="" {...props}>None</MenuItem>]

    options?.map((option, j) => {
      // console.log(j, option[computedOptions.label])
      menuItems.push(<MenuItem key={j + 1} value={j} {...props}>
        {option[computedOptions.label]}
      </MenuItem>);
    })

    return menuItems;
  }

  // if (fields === undefined) {
  //   return null;
  // }

  const selectControl =
    <Controller
      name={controllerName}
      control={control}
      render={({ field }) => {
        // console.log(props, field)
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

          {...getComputedMenuItems(computedOptions)}

        </Select>
      }}
    />;

  return <Item>
    {!!appField.props.label
      ? (
        <FormControl fullWidth={true} {...props}>
          <InputLabel
            size="small"
            id={`select-${appField.id}-label`}>{appField.props.label}</InputLabel>
          {selectControl}
        </FormControl>
      )
      : { selectControl }}
  </Item>;
};
