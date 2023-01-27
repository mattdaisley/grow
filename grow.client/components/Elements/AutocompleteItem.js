import { useContext } from 'react';
import { Controller, useFormContext } from "react-hook-form";

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { Item } from '../Item';
import { PageContext } from '../../app/PageContext';

export const AutocompleteItem = ({ appField, control, fieldArrayName }) => {

  const appFieldProps = appField.props ?? {};
  const { options: fieldOptions, computedOptions, ...props } = appFieldProps;

  const autoCompleteProps = {
    autoComplete: true,
    autoSelect: true,
    autoHighlight: true,
    ...props
  }
  // console.log(appField);

  const pageFormContext = useFormContext();
  const pageContext = useContext(PageContext);

  const fields = pageFormContext.watch(pageContext.fieldArrayName);
  // console.log(fields, pageContext.fieldArrayName)

  function getComputedMenuItems(computedOptions) {
    if (computedOptions === undefined || Object.keys(computedOptions).length === 0) {
      return [];
    }

    // console.log(props, computedOptions, fields[computedOptions.key]);

    const options = fields[computedOptions.key];

    let menuItems = []

    options?.map((option, j) => {
      // console.log(j, option[computedOptions.label])
      menuItems.push({ value: j, label: option[computedOptions.label] ?? "" });
    })

    return menuItems;
  }

  const menuItems = [
    ...(fieldOptions ?? []),
    ...getComputedMenuItems(computedOptions)
  ]
  // console.log(props, fieldOptions, menuItems)

  return <Item>
    <Controller
      name={`${fieldArrayName}.${appField.name}`}
      control={control}
      render={({ field: { value, onChange } }) => {

        return <Autocomplete
          fullWidth
          size="small"
          {...autoCompleteProps}
          id={`autocomplete-${appField.id}`}
          options={menuItems}
          value={value}
          onChange={(_, newValue) => onChange(newValue)}
          isOptionEqualToValue={(option, testValue) => option?.label === testValue?.label}
          renderInput={(params) => <TextField {...params} label={props.label} />}
        />
      }} />
  </Item>;
};
