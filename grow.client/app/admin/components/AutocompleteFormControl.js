import { useState, useMemo, useCallback } from 'react';
import { Controller, useFormContext } from "react-hook-form";

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import logger from '../../../services/logger';

export default function AutocompleteFormControl({ name, data, ...props }) {

  logger.log('AutocompleteFormControl', name, data, props)

  const controllerName = (name !== undefined) ? `${name}.${data.name}` : data.name;
  const controllerValueName = `${controllerName}.value`

  // const formMethods = useFormContext();
  const fields = props.formMethods.watch();

  const componentProps = {
    autoComplete: true,
    autoSelect: true,
    autoHighlight: true,
    ...data.props,
    label: data.label
  }

  let menuItems = useMemo(() => {
    return [
      ...getConfiguredMenuItems(data.options),
      ...getComputedMenuItems(data.computedOptions ?? [], fields)
    ]
  }, [data.options, data.computedOptions])

  let defaultValue = getSelectedItem(menuItems, props.dynamicData[controllerValueName]) ?? data.default ?? null

  logger.log('AutocompleteFormControl menuItems', menuItems)
  const setupHandleChange = useCallback((onChange) => {
    logger.log('AutocompleteFormControl setupHandleChange', controllerValueName)
    const action = props.actions.onFieldChange(controllerValueName, handleRemoteChange(onChange))
    return (_, newValue) => {
      logger.log('AutocompleteFormControl handleChange', _, newValue)
      action(_, newValue?.value ?? null)
    }
  }, [controllerValueName, menuItems, props.actions.onFieldChange])

  function handleRemoteChange(onChange) {
    return (_, value) => {
      const newValue = getSelectedItem(menuItems, value)
      logger.log('AutocompleteFormControl handleRemoteChange', value, newValue)
      onChange(newValue)
    }
  }

  function getSelectedItem(menuItems, value) {
    return menuItems?.find(item => item.value === value) ?? null;
  }

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
            onChange={setupHandleChange(onChange)}
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