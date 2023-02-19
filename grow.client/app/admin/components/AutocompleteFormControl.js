import { useState } from 'react';
import { Controller, useFormContext } from "react-hook-form";

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import logger from '../../../../grow.api/src/logger';

export default function AutocompleteFormControl({ name, data, ...props }) {

  logger.log('AutocompleteFormControl', name, data, props)

  const controllerName = (name !== undefined) ? `${name}.${data.name}` : data.name;

  // const formMethods = useFormContext();
  const fields = props.formMethods.watch();

  let defaultValue = data.default ?? null

  const componentProps = {
    autoComplete: true,
    autoSelect: true,
    autoHighlight: true,
    ...data.props,
    label: data.label
  }

  let menuItems = [
    ...getConfiguredMenuItems(data.options),
    ...getComputedMenuItems(data.computedOptions ?? [], fields)
  ]

  logger.log('AutocompleteFormControl menuItems', menuItems)

  return (
    <Controller
      name={controllerName}
      control={props.formMethods.control}
      defaultValue={defaultValue}
      render={({ field: { value, onChange } }) => {
        // logger.log(field);
        return (
          <Autocomplete
            fullWidth
            size="small"
            sx={{ fontSize: 'small' }}
            {...componentProps}
            options={menuItems}
            value={value ?? null}
            onChange={props.actions.onFieldChange(controllerName, (_, newValue) => onChange(newValue))}
            isOptionEqualToValue={(option, testValue) => option?.label === testValue?.label}
            renderInput={(params) => <TextField size="small" {...params} sx={{ fontSize: 'small' }} label={data.label} />}
          />
        )
      }}
    />
  )
};

function getConfiguredMenuItems(options) {
  if (options === undefined) {
    return []
  }

  const menuOptions = Object.keys(options).map(key => ({ ...options[key], value: key }));
  logger.log('getConfiguredMenuItems', options, menuOptions)
  return menuOptions
}

function getComputedMenuItems(computedOptions, fields) {
  if (computedOptions === undefined || Object.keys(computedOptions).length === 0) {
    return [];
  }

  // logger.log(props, computedOptions, fields[computedOptions.key]);

  const options = fields[computedOptions.key];

  let menuItems = []

  options?.map((option, j) => {
    // logger.log(j, option[computedOptions.label])
    menuItems.push({ value: j, label: option[computedOptions.label] ?? "" });
  })

  return menuItems;
}