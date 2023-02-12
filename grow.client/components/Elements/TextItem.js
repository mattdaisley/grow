import { useState } from 'react';
import { Controller, useFormContext } from "react-hook-form";

import TextField from '@mui/material/TextField';

import { NumberFormatCustom } from './util/NumberFormatCustom';
import { Item } from '../Item';

export const TextItem = ({ appField, control, fieldArrayName }) => {
  const [value, setValue] = useState("");

  const controllerName = (fieldArrayName !== undefined) ? `${fieldArrayName}.${appField.name}` : appField.name;

  const pageFormContext = useFormContext();
  const fields = pageFormContext.watch();
  // const currentField = pageFormContext.watch(controllerName);
  if (!fields.hasOwnProperty(controllerName)) {
    // console.log(controllerName, fields)
    return null;
  }

  const handleFieldChanged = (event) => {
    const targetValue = event.target.value;
    setValue(targetValue);
  };

  let inputProps = {};
  const { prefix, thousandsGroupStyle, thousandSeparator, decimalScale, ...props } = appField.props ?? {};
  if (appField.type === 'numeric') {
    inputProps.inputComponent = NumberFormatCustom;
    inputProps.inputProps = {
      prefix: prefix ?? "",
      thousandsGroupStyle: thousandsGroupStyle ?? "thousand",
      thousandSeparator: thousandSeparator ?? ",",
      decimalScale: decimalScale ?? 2
    }
  }

  // if (currentField === undefined) {
  // console.log(controllerName, currentField)
  // return null;
  // }

  // console.log(controllerName)
  const textControl = (
    <Controller
      name={controllerName}
      control={control}
      render={({ field }) => {
        // console.log(fieldArrayName, appField, field);
        return <TextField
          fullWidth={true}
          size="small"
          {...props}
          // onChange={handleFieldChanged}
          {...field}
          value={field.value ?? ""}
          InputProps={inputProps}
          sx={{ fontSize: 'small' }}
        />
      }
      } />

  );

  return <Item>{textControl}</Item>;
};
